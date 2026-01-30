import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChallengesService {
  constructor(private prisma: PrismaService) {}

  async getChallenge(challengeId: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      select: {
        id: true,
        title: true,
        description: true,
        points: true,
        order: true,
        hints: true,
        maxAttempts: true,
        round: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
          },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    return challenge;
  }

  async getChallengesByRound(roundId: string) {
    return this.prisma.challenge.findMany({
      where: {
        roundId,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        points: true,
        order: true,
        hints: true,
        maxAttempts: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  async getAllChallenges() {
    // Get current active round only
    const activeRound = await this.prisma.round.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { order: 'asc' },
    });

    if (!activeRound) {
      return [];
    }

    // Only show challenges from current active round
    return this.prisma.challenge.findMany({
      where: {
        roundId: activeRound.id,
        isActive: true,
      },
      include: {
        round: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });
  }
}
