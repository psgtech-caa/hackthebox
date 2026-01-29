import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScoreboardService {
  constructor(private prisma: PrismaService) {}

  async getScoreboard() {
    const teams = await this.prisma.team.findMany({
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
        submissions: {
          where: {
            isCorrect: true,
          },
          select: {
            challengeId: true,
            points: true,
            submittedAt: true,
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

    return teams.map((team, index) => ({
      rank: index + 1,
      id: team.id,
      name: team.name,
      username: team.user.username,
      totalScore: team.totalScore,
      solvedChallenges: team.submissions.length,
      lastSubmission: team.lastSubmission,
    }));
  }

  async getTeamStats(teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        submissions: {
          where: {
            isCorrect: true,
          },
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
            submittedAt: 'asc',
          },
        },
      },
    });

    if (!team) {
      return null;
    }

    const totalChallenges = await this.prisma.challenge.count({
      where: {
        isActive: true,
      },
    });

    return {
      team: {
        id: team.id,
        name: team.name,
        totalScore: team.totalScore,
      },
      solvedChallenges: team.submissions.length,
      totalChallenges,
      submissions: team.submissions,
    };
  }
}
