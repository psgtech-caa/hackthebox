import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoundStatus, RoundType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SubmissionsService {
  private round3Mutex: Map<string, boolean> = new Map();

  constructor(private prisma: PrismaService) {}

  async submitFlag(challengeId: string, flag: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { team: true },
    });

    if (!user.teamId) {
      throw new BadRequestException('You must be in a team to submit flags');
    }

    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        round: true,
      },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (!challenge.isActive) {
      throw new ForbiddenException('Challenge is not active');
    }

    if (challenge.round.status !== RoundStatus.ACTIVE) {
      throw new ForbiddenException('Round is not active');
    }

    // Check if already solved by this team
    const existingSolve = await this.prisma.submission.findFirst({
      where: {
        challengeId,
        teamId: user.teamId,
        isCorrect: true,
      },
    });

    if (existingSolve) {
      throw new BadRequestException('Your team has already solved this challenge');
    }

    // Check max attempts
    if (challenge.maxAttempts) {
      const attemptCount = await this.prisma.submission.count({
        where: {
          challengeId,
          userId,
        },
      });

      if (attemptCount >= challenge.maxAttempts) {
        throw new BadRequestException(`Maximum attempts (${challenge.maxAttempts}) reached for this challenge`);
      }
    }

    // Round 3 mutex - atomic win check
    if (challenge.round.type === RoundType.CATCH_THE_FLAG) {
      const mutexKey = `round3_${challenge.roundId}`;
      
      if (this.round3Mutex.get(mutexKey)) {
        throw new ForbiddenException('Round 3 has already been won');
      }

      // Check if anyone has solved this already
      const existingWin = await this.prisma.submission.findFirst({
        where: {
          challenge: {
            roundId: challenge.roundId,
          },
          isCorrect: true,
        },
      });

      if (existingWin) {
        throw new ForbiddenException('Round 3 has already been won');
      }

      // Set mutex
      this.round3Mutex.set(mutexKey, true);
    }

    // Validate flag (case-insensitive)
    const normalizedFlag = flag.trim().toLowerCase();
    const isCorrect = await bcrypt.compare(normalizedFlag, challenge.flagHash);

    const submission = await this.prisma.submission.create({
      data: {
        userId,
        teamId: user.teamId,
        challengeId,
        submittedFlag: flag,
        isCorrect,
        points: isCorrect ? challenge.points : 0,
      },
      include: {
        challenge: {
          select: {
            title: true,
            points: true,
          },
        },
      },
    });

    // Update team score if correct
    if (isCorrect) {
      await this.updateTeamScore(user.teamId);

      // Lock Round 3 immediately after first win
      if (challenge.round.type === RoundType.CATCH_THE_FLAG) {
        await this.lockRound(challenge.roundId);
      }
    } else {
      // Release mutex if incorrect
      if (challenge.round.type === RoundType.CATCH_THE_FLAG) {
        const mutexKey = `round3_${challenge.roundId}`;
        this.round3Mutex.delete(mutexKey);
      }
    }

    return {
      ...submission,
      message: isCorrect ? 'Correct! Points awarded.' : 'Incorrect flag.',
    };
  }

  private async updateTeamScore(teamId: string) {
    const totalPoints = await this.prisma.submission.aggregate({
      where: {
        teamId,
        isCorrect: true,
      },
      _sum: {
        points: true,
      },
    });

    await this.prisma.score.upsert({
      where: { teamId },
      create: {
        teamId,
        totalPoints: totalPoints._sum.points || 0,
        lastSolved: new Date(),
      },
      update: {
        totalPoints: totalPoints._sum.points || 0,
        lastSolved: new Date(),
      },
    });
  }

  private async lockRound(roundId: string) {
    await this.prisma.round.update({
      where: { id: roundId },
      data: { 
        status: RoundStatus.LOCKED,
        endTime: new Date(),
      },
    });
  }

  async getUserSubmissions(userId: string) {
    return this.prisma.submission.findMany({
      where: { userId },
      include: {
        challenge: {
          select: {
            title: true,
            points: true,
            round: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTeamSubmissions(teamId: string) {
    return this.prisma.submission.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            username: true,
          },
        },
        challenge: {
          select: {
            title: true,
            points: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
