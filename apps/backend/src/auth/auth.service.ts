import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RegisterDto, LoginDto, CreateTeamDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { username: dto.username },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email or username already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash,
        role: 'PARTICIPANT',
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      message: 'Registration successful',
      user,
    };
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    // Find user by email or username
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.usernameOrEmail },
          { username: dto.usernameOrEmail },
        ],
      },
      include: {
        team: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    if (user.isDisqualified) {
      throw new UnauthorizedException('Account is disqualified');
    }

    // Verify password
    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    // Log audit
    await this.auditService.log({
      userId: user.id,
      action: 'LOGIN',
      ipAddress,
      userAgent,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        team: user.team,
      },
    };
  }

  async createTeam(userId: string, dto: CreateTeamDto) {
    // Check if user already has a team
    const existingTeam = await this.prisma.team.findUnique({
      where: { userId },
    });

    if (existingTeam) {
      throw new ConflictException('User already has a team');
    }

    // Check if team name is taken
    const teamNameExists = await this.prisma.team.findUnique({
      where: { name: dto.teamName },
    });

    if (teamNameExists) {
      throw new ConflictException('Team name already taken');
    }

    // Create team
    const team = await this.prisma.team.create({
      data: {
        name: dto.teamName,
        userId,
      },
      include: {
        user: {
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

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        team: true,
      },
    });

    if (!user || !user.isActive || user.isDisqualified) {
      return null;
    }

    return user;
  }
}
