import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

export enum AuditAction {
  TENANT_CREATED = 'TENANT_CREATED',
  TENANT_SUSPENDED = 'TENANT_SUSPENDED',
  TENANT_CLOSED = 'TENANT_CLOSED',
  USER_CREATED = 'USER_CREATED',
  USER_LOCKED = 'USER_LOCKED',
  API_KEY_CREATED = 'API_KEY_CREATED',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
  SENDER_ID_REGISTERED = 'SENDER_ID_REGISTERED',
  SENDER_ID_APPROVED = 'SENDER_ID_APPROVED',
  SENDER_ID_REJECTED = 'SENDER_ID_REJECTED',
  WALLET_CREDITED = 'WALLET_CREDITED',
  WALLET_DEBITED = 'WALLET_DEBITED',
  WALLET_RESERVED = 'WALLET_RESERVED',
  WALLET_RELEASED = 'WALLET_RELEASED',
  WALLET_TOPUP_INITIATED = 'WALLET_TOPUP_INITIATED',
  WALLET_TOPUP_COMPLETED = 'WALLET_TOPUP_COMPLETED',
  WALLET_TOPUP_FAILED = 'WALLET_TOPUP_FAILED',
  ONBOARDING_COMPLETED = 'ONBOARDING_COMPLETED',
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    tenantId: string,
    action: AuditAction,
    resource: string,
    resourceId: string,
    metadata: Record<string, unknown> = {},
    userId?: string,
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: { tenantId, userId, action, resource, resourceId, metadata: metadata as any },
    });
  }

  async findByTenant(tenantId: string, limit = 100): Promise<any[]> {
    return this.prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
