import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { SubmissionsService } from './submissions.service';
import { SubmitFlagDto } from './dto/submission.dto';

@Controller('submissions')
@UseGuards(AuthGuard('jwt'))
export class SubmissionsController {
  constructor(private submissionsService: SubmissionsService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  submitFlag(@Body() dto: SubmitFlagDto, @Request() req) {
    return this.submissionsService.submitFlag(dto.challengeId, dto.flag, req.user.id);
  }

  @Get('me')
  getMySubmissions(@Request() req) {
    return this.submissionsService.getUserSubmissions(req.user.id);
  }

  @Get('team/:teamId')
  getTeamSubmissions(@Param('teamId') teamId: string) {
    return this.submissionsService.getTeamSubmissions(teamId);
  }
}
