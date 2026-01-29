import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RoundState } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  // ==========================================
  // ROUND MANAGEMENT
  // ==========================================

  async updateRoundState(roundId: string, state: RoundState, adminId: string) {
    const round = await this.prisma.round.findUnique({
      where: { id: roundId },
    });

    if (!round) {
      throw new NotFoundException('Round not found');
    }

    // Only one round can be active at a time
    if (state === 'ACTIVE') {
      await this.prisma.round.updateMany({
        where: {
          id: { not: roundId },
          state: 'ACTIVE',
        },
        data: {
          state: 'LOCKED',
        },
      });
    }

    const updateData: any = { state };

    if (state === 'ACTIVE' && !round.startedAt) {
      updateData.startedAt = new Date();
    }

    if (state === 'ENDED' && !round.endedAt) {
      updateData.endedAt = new Date();
    }

    const updatedRound = await this.prisma.round.update({
      where: { id: roundId },
      data: updateData,
    });

    await this.auditService.log({
      userId: adminId,
      action: 'ROUND_STATE_CHANGE',
      targetType: 'Round',
      targetId: roundId,
      metadata: { newState: state },
    });

    return updatedRound;
  }

  // ==========================================
  // CHALLENGE MANAGEMENT
  // ==========================================

  async toggleChallenge(challengeId: string, isActive: boolean, adminId: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    const updated = await this.prisma.challenge.update({
      where: { id: challengeId },
      data: { isActive },
    });

    await this.auditService.log({
      userId: adminId,
      action: 'CHALLENGE_STATE_CHANGE',
      targetType: 'Challenge',
      targetId: challengeId,
      metadata: { isActive },
    });

    return updated;
  }

  // ==========================================
  // TEAM MANAGEMENT
  // ==========================================

  async disqualifyTeam(teamId: string, isDisqualified: boolean, reason: string, adminId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const updated = await this.prisma.team.update({
      where: { id: teamId },
      data: { isDisqualified },
    });

    await this.auditService.log({
      userId: adminId,
      action: 'TEAM_DISQUALIFY',
      targetType: 'Team',
      targetId: teamId,
      metadata: { isDisqualified, reason },
    });

    return updated;
  }

  async adjustScore(teamId: string, points: number, reason: string, adminId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Create score adjustment record
    await this.prisma.scoreAdjustment.create({
      data: {
        teamId,
        adminId,
        points,
        reason,
      },
    });

    // Update team score
    const updated = await this.prisma.team.update({
      where: { id: teamId },
      data: {
        totalScore: {
          increment: points,
        },
      },
    });

    await this.auditService.log({
      userId: adminId,
      action: 'SCORE_ADJUSTMENT',
      targetType: 'Team',
      targetId: teamId,
      metadata: { points, reason },
    });

    return updated;
  }

  // ==========================================
  // EVENT MANAGEMENT
  // ==========================================

  async updateEventConfig(updates: any, adminId: string) {
    let config = await this.prisma.eventConfig.findFirst();

    if (!config) {
      config = await this.prisma.eventConfig.create({
        data: {
          eventName: 'HACK-THE-BOX',
          tagline: 'Decode. Discover. Defend.',
          duration: 180,
          isActive: false,
        },
      });
    }

    const updateData: any = {};

    if (updates.isActive !== undefined) {
      updateData.isActive = updates.isActive;
      if (updates.isActive && !config.startedAt) {
        updateData.startedAt = new Date();
      }
      if (!updates.isActive && config.isActive) {
        updateData.endedAt = new Date();
      }
    }

    if (updates.scoreboardFrozen !== undefined) {
      updateData.scoreboardFrozen = updates.scoreboardFrozen;
    }

    return this.prisma.eventConfig.update({
      where: { id: config.id },
      data: updateData,
    });
  }

  // ==========================================
  // STATISTICS & REPORTING
  // ==========================================

  async getDashboardStats() {
    const [totalTeams, activeTeams, totalSubmissions, correctSubmissions] = await Promise.all([
      this.prisma.team.count(),
      this.prisma.team.count({ where: { isDisqualified: false } }),
      this.prisma.submission.count(),
      this.prisma.submission.count({ where: { isCorrect: true } }),
    ]);

    const rounds = await this.prisma.round.findMany({
      include: {
        challenges: {
          select: {
            id: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    return {
      teams: {
        total: totalTeams,
        active: activeTeams,
        disqualified: totalTeams - activeTeams,
      },
      submissions: {
        total: totalSubmissions,
        correct: correctSubmissions,
        incorrect: totalSubmissions - correctSubmissions,
      },
      rounds: rounds.map(r => ({
        id: r.id,
        name: r.name,
        state: r.state,
        challengeCount: r.challenges.length,
        activeChallenges: r.challenges.filter(c => c.isActive).length,
      })),
    };
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
        user: {
          select: {
            id: true,
            username: true,
          },
        },
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
      take: 1000,
    });
  }

  async exportResults() {
    const teams = await this.prisma.team.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
        submissions: {
          where: {
            isCorrect: true,
          },
          include: {
            challenge: {
              select: {
                title: true,
                points: true,
              },
            },
          },
        },
      },
      orderBy: [
        { totalScore: 'desc' },
        { lastSubmission: 'asc' },
      ],
    });

    return teams.map((team, index) => ({
      rank: index + 1,
      teamName: team.name,
      username: team.user.username,
      email: team.user.email,
      totalScore: team.totalScore,
      solvedChallenges: team.submissions.length,
      lastSubmission: team.lastSubmission,
      isDisqualified: team.isDisqualified,
    }));
  }
}
