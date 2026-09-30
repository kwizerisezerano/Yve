import { Injectable } from '@nestjs/common';
import { TenantStatus as PrismaTenantStatus, type Tenant as PrismaTenant } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { ConflictDomainException } from '../../../shared/common/exceptions/conflict.exception';
import { NotFoundDomainException } from '../../../shared/common/exceptions/not-found.exception';
import {
  isForeignKeyViolation,
  isKnownPrismaError,
  PRISMA_RECORD_NOT_FOUND,
  PRISMA_UNIQUE_CONSTRAINT_VIOLATION,
} from '../../../shared/common/prisma-errors';
import { Tenant, TenantStatus } from '../entities/tenant.entity';
import { TenantRepository } from '../interfaces/tenant.repository.interface';

const TO_PRISMA_STATUS: Record<TenantStatus, PrismaTenantStatus> = {
  [TenantStatus.ACTIVE]: PrismaTenantStatus.ACTIVE,
  [TenantStatus.DISABLED]: PrismaTenantStatus.DISABLED,
};

const FROM_PRISMA_STATUS: Record<PrismaTenantStatus, TenantStatus> = {
  [PrismaTenantStatus.ACTIVE]: TenantStatus.ACTIVE,
  [PrismaTenantStatus.DISABLED]: TenantStatus.DISABLED,
};

@Injectable()
export class PrismaTenantRepository implements TenantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenant: Tenant): Promise<Tenant> {
    try {
      const created = await this.prisma.tenant.create({ data: toPersistence(tenant) });
      return toDomain(created);
    } catch (error) {
      if (isKnownPrismaError(error, PRISMA_UNIQUE_CONSTRAINT_VIOLATION)) {
        throw new ConflictDomainException('Generated api key collided, please retry.');
      }
      throw error;
    }
  }

  async findById(id: string): Promise<Tenant | null> {
    const found = await this.prisma.tenant.findUnique({ where: { id } });
    return found ? toDomain(found) : null;
  }

  async findByApiKeyHash(apiKeyHash: string): Promise<Tenant | null> {
    const found = await this.prisma.tenant.findUnique({ where: { apiKeyHash } });
    return found ? toDomain(found) : null;
  }

  async findAll(): Promise<Tenant[]> {
    const found = await this.prisma.tenant.findMany({ orderBy: { createdAt: 'desc' } });
    return found.map(toDomain);
  }

  async update(tenant: Tenant): Promise<Tenant> {
    try {
      const updated = await this.prisma.tenant.update({
        where: { id: tenant.id },
        data: toPersistence(tenant),
      });
      return toDomain(updated);
    } catch (error) {
      if (isKnownPrismaError(error, PRISMA_RECORD_NOT_FOUND)) {
        throw new NotFoundDomainException(`Tenant ${tenant.id} not found.`);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.tenant.delete({ where: { id } });
    } catch (error) {
      if (isKnownPrismaError(error, PRISMA_RECORD_NOT_FOUND)) {
        throw new NotFoundDomainException(`Tenant ${id} not found.`);
      }
      if (isForeignKeyViolation(error)) {
        throw new ConflictDomainException(`Cannot delete tenant ${id}: it still has messages.`);
      }
      throw error;
    }
  }
}

function toPersistence(tenant: Tenant) {
  return {
    id: tenant.id,
    name: tenant.name,
    phone: tenant.phone,
    apiKeyHash: tenant.apiKeyHash,
    defaultSender: tenant.defaultSender,
    webhookUrl: tenant.webhookUrl,
    status: TO_PRISMA_STATUS[tenant.status],
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt,
  };
}

function toDomain(record: PrismaTenant): Tenant {
  return new Tenant({
    id: record.id,
    name: record.name,
    phone: record.phone,
    apiKeyHash: record.apiKeyHash,
    defaultSender: record.defaultSender,
    webhookUrl: record.webhookUrl,
    status: FROM_PRISMA_STATUS[record.status],
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}
