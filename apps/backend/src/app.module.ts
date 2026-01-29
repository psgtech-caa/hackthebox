import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TeamsModule } from './teams/teams.module';
import { RoundsModule } from './rounds/rounds.module';
import { ChallengesModule } from './challenges/challenges.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { ScoreboardModule } from './scoreboard/scoreboard.module';
import { AdminModule } from './admin/admin.module';
import { AuditModule } from './audit/audit.module';
import { EventModule } from './event/event.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    TeamsModule,
    RoundsModule,
    ChallengesModule,
    SubmissionsModule,
    ScoreboardModule,
    AdminModule,
    AuditModule,
    EventModule,
  ],
})
export class AppModule {}
