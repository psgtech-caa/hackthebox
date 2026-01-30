import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScoreboardService {
  constructor(private prisma: PrismaService) {}

  async getScoreboard() {
    const scores = await this.prisma.score.findMany({
      include: {
        team: {
          include: {
            members: {
              select: {
                username: true,
              },
            },
          },
        },
      },
      orderBy: [
        { totalPoints: 'desc' },
        { lastSolved: 'asc' },
      ],
    });

    return scores.map((score, index) => ({
      rank: index + 1,
      teamId: score.teamId,
      teamName: score.team.name,
      totalPoints: score.totalPoints,
      lastSolved: score.lastSolved,
      memberCount: score.team.members.length,
      members: score.team.members.map(m => m.username),
    }));
  }

  async getTeamStats(teamId: string) {
    const score = await this.prisma.score.findUnique({
      where: { teamId },
      include: {
        team: {
          include: {
            submissions: {
              where: { isCorrect: true },
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
                user: {
                  select: {
                    username: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!score) {
      return {
        teamId,
        totalPoints: 0,
        solvedChallenges: 0,
        submissions: [],
      };
    }

    return {
      teamId,
      teamName: score.team.name,
      totalPoints: score.totalPoints,
      solvedChallenges: score.team.submissions.length,
      lastSolved: score.lastSolved,
      submissions: score.team.submissions,
    };
  }
}
