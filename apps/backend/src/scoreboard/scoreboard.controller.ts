import { Controller, Get, Sse, MessageEvent, UseGuards } from '@nestjs/common';
import { Observable, interval, map, switchMap, from } from 'rxjs';
import { ScoreboardService } from './scoreboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('scoreboard')
export class ScoreboardController {
  constructor(private scoreboardService: ScoreboardService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getScoreboard() {
    return this.scoreboardService.getScoreboard();
  }

  @Sse('live')
  liveScoreboard(): Observable<MessageEvent> {
    return interval(5000).pipe(
      switchMap(() => from(this.scoreboardService.getScoreboard())),
      map((data) => ({
        data: { scoreboard: data, timestamp: new Date().toISOString() },
      })),
    );
  }
}
