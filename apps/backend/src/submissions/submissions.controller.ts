import { Controller, Post, Get, Body, UseGuards, Req, Param, BadRequestException } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmitFlagDto } from './dto/submit-flag.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('submissions')
@UseGuards(JwtAuthGuard)
export class SubmissionsController {
  constructor(private submissionsService: SubmissionsService) {}

  @Post()
  async submitFlag(@Body() dto: SubmitFlagDto, @Req() req: any) {
    if (!req.user.team) {
      throw new BadRequestException('You must create a team first');
    }

    return this.submissionsService.submitFlag(
      req.user.id,
      req.user.team.id,
      dto.challengeId,
      dto.flag,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Get('my-submissions')
  async getMySubmissions(@Req() req: any) {
    if (!req.user.team) {
      return [];
    }

    return this.submissionsService.getTeamSubmissions(req.user.team.id);
  }

  @Get('challenge/:challengeId')
  async getChallengeSubmissions(@Param('challengeId') challengeId: string) {
    return this.submissionsService.getChallengeSubmissions(challengeId);
  }
}
