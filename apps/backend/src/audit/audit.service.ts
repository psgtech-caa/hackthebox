import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@prisma/client';

interface AuditLogData {
  userId?: string;
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: AuditLogData) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          targetType: data.targetType,
          targetId: data.targetId,
          metadata: data.metadata,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  }

  async getLogs(filters?: {
    userId?: string;
    action?: AuditAction;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    return this.prisma.auditLog.findMany({
      where: {
        userId: filters?.userId,
        action: filters?.action,
        createdAt: {
          gte: filters?.startDate,
          lte: filters?.endDate,
        },
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
      orderBy: {
        createdAt: 'desc',
      },
      take: filters?.limit || 100,
    });
  }
}
