import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/team.dto';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async createTeam(dto: CreateTeamDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user.teamId) {
      throw new BadRequestException('You are already in a team');
    }

    const existingTeam = await this.prisma.team.findUnique({
      where: { name: dto.name },
    });

    if (existingTeam) {
      throw new ConflictException('Team name already exists');
    }

    const team = await this.prisma.team.create({
      data: {
        name: dto.name,
        members: {
          connect: { id: userId },
        },
      },
      include: {
        members: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return team;
  }

  async joinTeam(teamId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user.teamId) {
      throw new BadRequestException('You are already in a team');
    }

    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { teamId },
    });

    return this.getTeam(teamId);
  }

  async getTeam(teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        scores: true,
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  async getAllTeams() {
    return this.prisma.team.findMany({
      include: {
        members: {
          select: {
            id: true,
            username: true,
          },
        },
        scores: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
