import { Controller, Get, UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('event')
@UseGuards(JwtAuthGuard)
export class EventController {
  constructor(private eventService: EventService) {}

  @Get('status')
  async getEventStatus() {
    return this.eventService.getEventStatus();
  }

  @Get('config')
  async getEventConfig() {
    return this.eventService.getEventConfig();
  }
}
