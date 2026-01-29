import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RoundsService } from './rounds.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('rounds')
@UseGuards(JwtAuthGuard)
export class RoundsController {
  constructor(private roundsService: RoundsService) {}

  @Get()
  async findAll() {
    return this.roundsService.findAll();
  }

  @Get('active')
  async getActiveRound() {
    return this.roundsService.getActiveRound();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.roundsService.findById(id);
  }
}
