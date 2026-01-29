import { Injectable, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { AuditService } from '../audit/audit.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SubmissionsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private auditService: AuditService,
  ) {}

  async submitFlag(
    userId: string,
    teamId: string,
    challengeId: string,
    flag: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Get challenge with round info
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        round: true,
      },
    });

    if (!challenge) {
      throw new BadRequestException('Challenge not found');
    }

    if (!challenge.isActive) {
      throw new BadRequestException('Challenge is not active');
    }

    // Check if round is active
    if (challenge.round.state !== 'ACTIVE') {
      throw new BadRequestException('Round is not active');
    }

    // Check if team exists and is not disqualified
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new BadRequestException('Team not found');
    }

    if (team.isDisqualified) {
      throw new ForbiddenException('Team is disqualified');
    }

    // Check if already solved
    const alreadySolved = await this.prisma.submission.findFirst({
      where: {
        teamId,
        challengeId,
        isCorrect: true,
      },
    });

    if (alreadySolved) {
      throw new BadRequestException('Challenge already solved');
    }

    // Rate limiting per team per challenge
    const rateLimitKey = `ratelimit:${teamId}:${challengeId}`;
    const canSubmit = await this.redis.checkRateLimit(rateLimitKey, 10, 60);
    
    if (!canSubmit) {
      throw new BadRequestException('Too many attempts. Please wait.');
    }

    // Check max attempts if limited
    if (challenge.maxAttempts > 0) {
      const attemptCount = await this.prisma.submission.count({
        where: {
          teamId,
          challengeId,
        },
      });

      if (attemptCount >= challenge.maxAttempts) {
        throw new BadRequestException('Maximum attempts reached for this challenge');
      }
    }

    // Validate flag (case-insensitive)
    const isCorrect = await bcrypt.compare(flag.trim().toLowerCase(), challenge.flagHash);

    // Calculate attempt number
    const attemptNumber = await this.prisma.submission.count({
      where: { teamId, challengeId },
    }) + 1;

    // Create submission
    const submission = await this.prisma.submission.create({
      data: {
        teamId,
        userId,
        challengeId,
        submittedFlag: flag,
        isCorrect,
        points: isCorrect ? challenge.points : 0,
        attemptNumber,
        ipAddress,
        userAgent,
      },
    });

    // If correct, update team score
    if (isCorrect) {
      await this.prisma.team.update({
        where: { id: teamId },
        data: {
          totalScore: {
            increment: challenge.points,
          },
          lastSubmission: new Date(),
        },
      });

      // If this is the final flag in Round 3, end the round
      if (challenge.isFinalFlag) {
        await this.prisma.round.update({
          where: { id: challenge.roundId },
          data: {
            state: 'ENDED',
            endedAt: new Date(),
          },
        });
      }
    }

    // Audit log
    await this.auditService.log({
      userId,
      action: 'SUBMIT_FLAG',
      targetType: 'Challenge',
      targetId: challengeId,
      metadata: {
        isCorrect,
        points: isCorrect ? challenge.points : 0,
        attemptNumber,
      },
      ipAddress,
      userAgent,
    });

    return {
      id: submission.id,
      isCorrect: submission.isCorrect,
      points: submission.points,
      attemptNumber: submission.attemptNumber,
      message: isCorrect ? 'Correct flag!' : 'Incorrect flag. Try again.',
    };
  }

  async getTeamSubmissions(teamId: string) {
    return this.prisma.submission.findMany({
      where: { teamId },
      include: {
        challenge: {
          select: {
            id: true,
            title: true,
            type: true,
            points: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });
  }

  async getChallengeSubmissions(challengeId: string) {
    return this.prisma.submission.findMany({
      where: {
        challengeId,
        isCorrect: true,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'asc',
      },
    });
  }

  async getAllSubmissions() {
    return this.prisma.submission.findMany({
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        challenge: {
          select: {
            id: true,
            title: true,
            points: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
      take: 500,
    });
  }
}
