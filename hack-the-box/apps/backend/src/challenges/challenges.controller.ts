import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChallengesService } from './challenges.service';

@Controller('challenges')
@UseGuards(AuthGuard('jwt'))
export class ChallengesController {
  constructor(private challengesService: ChallengesService) {}

  @Get()
  getAllChallenges() {
    return this.challengesService.getAllChallenges();
  }

  @Get('round/:roundId')
  getChallengesByRound(@Param('roundId') roundId: string) {
    return this.challengesService.getChallengesByRound(roundId);
  }

  @Get(':id')
  getChallenge(@Param('id') id: string) {
    return this.challengesService.getChallenge(id);
  }
}
