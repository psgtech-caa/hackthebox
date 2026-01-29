import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoundState } from '@prisma/client';

@Injectable()
export class RoundsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.round.findMany({
      include: {
        challenges: {
          select: {
            id: true,
            title: true,
            points: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async findById(id: string) {
    const round = await this.prisma.round.findUnique({
      where: { id },
      include: {
        challenges: {
          where: {
            isActive: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!round) {
      throw new NotFoundException('Round not found');
    }

    return round;
  }

  async getActiveRound() {
    return this.prisma.round.findFirst({
      where: {
        state: 'ACTIVE',
      },
      include: {
        challenges: {
          where: {
            isActive: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async updateRoundState(roundId: string, state: RoundState) {
    const round = await this.prisma.round.findUnique({
      where: { id: roundId },
    });

    if (!round) {
      throw new NotFoundException('Round not found');
    }

    // Validation: Only one round can be active at a time
    if (state === 'ACTIVE') {
      const activeRound = await this.prisma.round.findFirst({
        where: {
          state: 'ACTIVE',
          id: { not: roundId },
        },
      });

      if (activeRound) {
        throw new BadRequestException('Another round is already active');
      }
    }

    const updateData: any = { state };

    if (state === 'ACTIVE' && !round.startedAt) {
      updateData.startedAt = new Date();
    }

    if (state === 'ENDED' && !round.endedAt) {
      updateData.endedAt = new Date();
    }

    return this.prisma.round.update({
      where: { id: roundId },
      data: updateData,
    });
  }
}
