import { Injectable } from '@nestjs/common';
import {
  ProviderStatus as PrismaProviderStatus,
  type Provider as PrismaProvider,
} from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { ConflictDomainException } from '../../../shared/common/exceptions/conflict.exception';
import { NotFoundDomainException } from '../../../shared/common/exceptions/not-found.exception';
import {
  isForeignKeyViolation,
  isKnownPrismaError,
  PRISMA_RECORD_NOT_FOUND,
  PRISMA_UNIQUE_CONSTRAINT_VIOLATION,
} from '../../../shared/common/prisma-errors';
import { Provider, ProviderStatus } from '../entities/provider.entity';
import { ProviderRepository } from '../interfaces/provider.repository.interface';

const TO_PRISMA_STATUS: Record<ProviderStatus, PrismaProviderStatus> = {
  [ProviderStatus.ACTIVE]: PrismaProviderStatus.ACTIVE,
  [ProviderStatus.DISABLED]: PrismaProviderStatus.DISABLED,
};

const FROM_PRISMA_STATUS: Record<PrismaProviderStatus, ProviderStatus> = {
  [PrismaProviderStatus.ACTIVE]: ProviderStatus.ACTIVE,
  [PrismaProviderStatus.DISABLED]: ProviderStatus.DISABLED,
};

@Injectable()
export class PrismaProviderRepository implements ProviderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(provider: Provider): Promise<Provider> {
    try {
      const created = await this.prisma.provider.create({ data: toPersistence(provider) });
      return toDomain(created);
    } catch (error) {
      if (isKnownPrismaError(error, PRISMA_UNIQUE_CONSTRAINT_VIOLATION)) {
        throw new ConflictDomainException(`Provider ${provider.name} already exists.`);
      }
      throw error;
    }
  }

  async findById(id: string): Promise<Provider | null> {
    const found = await this.prisma.provider.findUnique({ where: { id } });
    return found ? toDomain(found) : null;
  }

  async findByIds(ids: string[]): Promise<Provider[]> {
    if (ids.length === 0) {
      return [];
    }
    const found = await this.prisma.provider.findMany({ where: { id: { in: ids } } });
    return found.map(toDomain);
  }

  async findAll(): Promise<Provider[]> {
    const found = await this.prisma.provider.findMany({ orderBy: { createdAt: 'desc' } });
    return found.map(toDomain);
  }

  async update(provider: Provider): Promise<Provider> {
    try {
      const updated = await this.prisma.provider.update({
        where: { id: provider.id },
        data: toPersistence(provider),
      });
      return toDomain(updated);
    } catch (error) {
      if (isKnownPrismaError(error, PRISMA_RECORD_NOT_FOUND)) {
        throw new NotFoundDomainException(`Provider ${provider.id} not found.`);
      }
      if (isKnownPrismaError(error, PRISMA_UNIQUE_CONSTRAINT_VIOLATION)) {
        throw new ConflictDomainException(`Provider ${provider.name} already exists.`);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.provider.delete({ where: { id } });
    } catch (error) {
      if (isKnownPrismaError(error, PRISMA_RECORD_NOT_FOUND)) {
        throw new NotFoundDomainException(`Provider ${id} not found.`);
      }
      if (isForeignKeyViolation(error)) {
        throw new ConflictDomainException(
          `Cannot delete provider ${id}: it is still referenced by a routing rule.`,
        );
      }
      throw error;
    }
  }
}

function toPersistence(provider: Provider) {
  return {
    id: provider.id,
    name: provider.name,
    description: provider.description,
    defaultCost: provider.defaultCost,
    status: TO_PRISMA_STATUS[provider.status],
    createdAt: provider.createdAt,
    updatedAt: provider.updatedAt,
  };
}

function toDomain(record: PrismaProvider): Provider {
  return new Provider({
    id: record.id,
    name: record.name,
    description: record.description,
    defaultCost: record.defaultCost,
    status: FROM_PRISMA_STATUS[record.status],
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}
