import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoundsService } from './rounds.service';

@Controller('rounds')
@UseGuards(AuthGuard('jwt'))
export class RoundsController {
  constructor(private roundsService: RoundsService) {}

  @Get('current')
  getCurrentRound() {
    return this.roundsService.getCurrentRound();
  }

  @Get()
  getAllRounds() {
    return this.roundsService.getAllRounds();
  }

  @Get(':id')
  getRound(@Param('id') id: string) {
    return this.roundsService.getRound(id);
  }
}
