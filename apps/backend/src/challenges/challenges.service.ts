import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChallengesService {
  constructor(private prisma: PrismaService) {}

  async findAll(roundId?: string) {
    const where: any = { isActive: true };
    if (roundId) {
      where.roundId = roundId;
    }

    return this.prisma.challenge.findMany({
      where,
      select: {
        id: true,
        roundId: true,
        title: true,
        description: true,
        type: true,
        points: true,
        maxAttempts: true,
        order: true,
        hints: true,
        round: {
          select: {
            id: true,
            name: true,
            state: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async findById(id: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id },
      select: {
        id: true,
        roundId: true,
        title: true,
        description: true,
        type: true,
        points: true,
        maxAttempts: true,
        order: true,
        hints: true,
        isActive: true,
        isFinalFlag: true,
        round: {
          select: {
            id: true,
            name: true,
            state: true,
          },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    return challenge;
  }

  async getActiveChallenges(roundId: string) {
    return this.prisma.challenge.findMany({
      where: {
        roundId,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        points: true,
        maxAttempts: true,
        order: true,
        hints: true,
        isFinalFlag: true,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }
}
