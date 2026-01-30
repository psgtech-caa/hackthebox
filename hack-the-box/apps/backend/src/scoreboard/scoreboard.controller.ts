import { Controller, Get, Param, UseGuards, Sse, MessageEvent } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable, interval } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ScoreboardService } from './scoreboard.service';

@Controller('scoreboard')
@UseGuards(AuthGuard('jwt'))
export class ScoreboardController {
  constructor(private scoreboardService: ScoreboardService) {}

  @Get()
  getScoreboard() {
    return this.scoreboardService.getScoreboard();
  }

  @Get('team/:teamId')
  getTeamStats(@Param('teamId') teamId: string) {
    return this.scoreboardService.getTeamStats(teamId);
  }

  @Sse('live')
  liveScoreboard(): Observable<MessageEvent> {
    return interval(5000).pipe(
      switchMap(() => this.scoreboardService.getScoreboard()),
      map((scoreboard) => ({
        data: scoreboard,
      })),
    );
  }
}
