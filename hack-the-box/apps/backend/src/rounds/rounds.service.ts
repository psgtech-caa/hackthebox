import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoundStatus } from '@prisma/client';

@Injectable()
export class RoundsService {
  constructor(private prisma: PrismaService) {}

  async getCurrentRound() {
    const activeRound = await this.prisma.round.findFirst({
      where: { status: RoundStatus.ACTIVE },
      include: {
        challenges: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            points: true,
            order: true,
            hints: true,
            maxAttempts: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    if (!activeRound) {
      return null;
    }

    return activeRound;
  }

  async getAllRounds() {
    return this.prisma.round.findMany({
      include: {
        challenges: {
          select: {
            id: true,
            title: true,
            points: true,
            order: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async getRound(roundId: string) {
    const round = await this.prisma.round.findUnique({
      where: { id: roundId },
      include: {
        challenges: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!round) {
      throw new NotFoundException('Round not found');
    }

    return round;
  }
}
