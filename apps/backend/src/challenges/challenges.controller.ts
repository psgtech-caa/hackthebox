import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('challenges')
@UseGuards(JwtAuthGuard)
export class ChallengesController {
  constructor(private challengesService: ChallengesService) {}

  @Get()
  async findAll(@Query('roundId') roundId?: string) {
    return this.challengesService.findAll(roundId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.challengesService.findById(id);
  }
}
