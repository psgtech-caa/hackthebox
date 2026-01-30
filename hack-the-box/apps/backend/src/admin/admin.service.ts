import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoundDto, UpdateRoundStatusDto, CreateChallengeDto, UpdateChallengeDto } from './dto/admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // Round Management
  async createRound(dto: CreateRoundDto) {
    return this.prisma.round.create({
      data: dto,
    });
  }

  async updateRoundStatus(roundId: string, dto: UpdateRoundStatusDto) {
    return this.prisma.round.update({
      where: { id: roundId },
      data: { status: dto.status },
    });
  }

  async deleteRound(roundId: string) {
    await this.prisma.round.delete({
      where: { id: roundId },
    });
    return { message: 'Round deleted successfully' };
  }

  // Challenge Management
  async createChallenge(dto: CreateChallengeDto) {
    const flagHash = await bcrypt.hash(dto.flag.toLowerCase(), 10);

    const { flag, ...data } = dto;

    return this.prisma.challenge.create({
      data: {
        ...data,
        flagHash,
      },
    });
  }

  async updateChallenge(challengeId: string, dto: UpdateChallengeDto) {
    return this.prisma.challenge.update({
      where: { id: challengeId },
      data: dto,
    });
  }

  async deleteChallenge(challengeId: string) {
    await this.prisma.challenge.delete({
      where: { id: challengeId },
    });
    return { message: 'Challenge deleted successfully' };
  }

  // User Management
  async updateUserRole(userId: string, role: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
    });
  }

  async deleteUser(userId: string) {
    await this.prisma.user.delete({
      where: { id: userId },
    });
    return { message: 'User deleted successfully' };
  }

  // Statistics
  async getStatistics() {
    const [
      totalUsers,
      totalTeams,
      totalRounds,
      totalChallenges,
      totalSubmissions,
      correctSubmissions,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.team.count(),
      this.prisma.round.count(),
      this.prisma.challenge.count(),
      this.prisma.submission.count(),
      this.prisma.submission.count({ where: { isCorrect: true } }),
    ]);

    return {
      totalUsers,
      totalTeams,
      totalRounds,
      totalChallenges,
      totalSubmissions,
      correctSubmissions,
      successRate: totalSubmissions > 0 ? (correctSubmissions / totalSubmissions) * 100 : 0,
    };
  }

  async getAllSubmissions() {
    return this.prisma.submission.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
        team: {
          select: {
            name: true,
          },
        },
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
      take: 100,
    });
  }

  async resetCompetition() {
    await this.prisma.submission.deleteMany({});
    await this.prisma.score.deleteMany({});
    await this.prisma.round.updateMany({
      data: { status: 'PENDING' },
    });
    
    return { message: 'Competition reset successfully' };
  }

  // Score Management
  async adjustTeamScore(teamId: string, points: number, reason: string) {
    const score = await this.prisma.score.findUnique({
      where: { teamId },
    });

    if (!score) {
      throw new NotFoundException('Team score not found');
    }

    const newTotal = Math.max(0, score.totalPoints + points);

    await this.prisma.score.update({
      where: { teamId },
      data: { totalPoints: newTotal },
    });

    return {
      message: `Score adjusted by ${points} points. Reason: ${reason}`,
      newTotal,
    };
  }

  async disqualifyTeam(teamId: string, reason: string) {
    await this.prisma.team.update({
      where: { id: teamId },
      data: {
        disqualified: true,
        members: {
          updateMany: {
            where: { teamId },
            data: { role: 'JUDGE' }, // Use JUDGE role as disqualified marker
          },
        },
      },
    });

    await this.prisma.score.update({
      where: { teamId },
      data: { totalPoints: 0 },
    });

    return {
      message: `Team disqualified. Reason: ${reason}`,
    };
  }

  async qualifyTeam(teamId: string) {
    await this.prisma.team.update({
      where: { id: teamId },
      data: {
        qualified: true,
        qualifiedAt: new Date(),
      },
    });

    return {
      message: 'Team qualified for next round',
    };
  }

  async qualifyTopTeams(count: number) {
    const topTeams = await this.prisma.score.findMany({
      take: count,
      orderBy: [
        { totalPoints: 'desc' },
        { lastSolved: 'asc' },
      ],
      include: {
        team: true,
      },
    });

    const qualifiedIds = [];
    for (const score of topTeams) {
      await this.prisma.team.update({
        where: { id: score.teamId },
        data: {
          qualified: true,
          qualifiedAt: new Date(),
        },
      });
      qualifiedIds.push(score.teamId);
    }

    return {
      message: `Qualified top ${count} teams`,
      qualifiedTeams: qualifiedIds,
    };
  }

  async freezeScoreboard(freeze: boolean) {
    await this.prisma.systemConfig.upsert({
      where: { key: 'scoreboard_frozen' },
      create: { key: 'scoreboard_frozen', value: freeze.toString() },
      update: { value: freeze.toString() },
    });

    return {
      message: `Scoreboard ${freeze ? 'frozen' : 'unfrozen'}`,
      frozen: freeze,
    };
  }

  async exportResults() {
    const [teams, submissions, rounds] = await Promise.all([
      this.prisma.team.findMany({
        include: {
          members: {
            select: {
              username: true,
              email: true,
            },
          },
          scores: true,
        },
      }),
      this.prisma.submission.findMany({
        where: { isCorrect: true },
        include: {
          user: {
            select: {
              username: true,
            },
          },
          team: {
            select: {
              name: true,
            },
          },
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
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.round.findMany({
        include: {
          challenges: true,
        },
        orderBy: { order: 'asc' },
      }),
    ]);

    return {
      exportDate: new Date().toISOString(),
      teams: teams.map(team => ({
        id: team.id,
        name: team.name,
        members: team.members,
        totalPoints: team.scores[0]?.totalPoints || 0,
        lastSolved: team.scores[0]?.lastSolved,
      })),
      submissions,
      rounds,
      statistics: await this.getStatistics(),
    };
  }

  async exportResultsCSV() {
    const teams = await this.prisma.team.findMany({
      include: {
        members: {
          select: {
            username: true,
            email: true,
          },
        },
        scores: true,
      },
      orderBy: {
        scores: {
          _count: 'desc',
        },
      },
    });

    // Build CSV content
    let csv = 'Rank,Team Name,Members,Total Points,Last Solve Time,Qualified,Status\n';
    
    let rank = 1;
    const sortedTeams = teams
      .map(team => ({
        ...team,
        totalPoints: team.scores[0]?.totalPoints || 0,
        lastSolved: team.scores[0]?.lastSolved || null,
      }))
      .sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        if (!a.lastSolved) return 1;
        if (!b.lastSolved) return -1;
        return new Date(a.lastSolved).getTime() - new Date(b.lastSolved).getTime();
      });

    for (const team of sortedTeams) {
      const memberNames = team.members.map(m => m.username).join(';');
      const status = team.disqualified ? 'DISQUALIFIED' : 'ACTIVE';
      const lastSolvedStr = team.lastSolved ? new Date(team.lastSolved).toISOString() : 'N/A';
      
      csv += `${rank},"${team.name}","${memberNames}",${team.totalPoints},${lastSolvedStr},${team.qualified},${status}\n`;
      rank++;
    }

    return csv;
  }
}
