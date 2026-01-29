import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.team.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        totalScore: 'desc',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.team.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
        submissions: {
          where: {
            isCorrect: true,
          },
          include: {
            challenge: {
              select: {
                id: true,
                title: true,
                points: true,
              },
            },
          },
          orderBy: {
            submittedAt: 'asc',
          },
        },
      },
    });
  }

  async getLeaderboard() {
    return this.prisma.team.findMany({
      where: {
        isDisqualified: false,
      },
      select: {
        id: true,
        name: true,
        totalScore: true,
        lastSubmission: true,
        user: {
          select: {
            username: true,
          },
        },
      },
      orderBy: [
        {
          totalScore: 'desc',
        },
        {
          lastSubmission: 'asc',
        },
      ],
    });
  }
}
