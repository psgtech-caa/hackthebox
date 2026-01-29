import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async getEventConfig() {
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

    return config;
  }

  async getEventStatus() {
    const config = await this.getEventConfig();
    const activeRound = await this.prisma.round.findFirst({
      where: { state: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        number: true,
      },
    });

    const totalTeams = await this.prisma.team.count();
    const activeTeams = await this.prisma.team.count({
      where: {
        isDisqualified: false,
      },
    });

    return {
      event: {
        name: config.eventName,
        tagline: config.tagline,
        isActive: config.isActive,
        startedAt: config.startedAt,
        endedAt: config.endedAt,
        duration: config.duration,
      },
      activeRound,
      stats: {
        totalTeams,
        activeTeams,
      },
    };
  }
}
