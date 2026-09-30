import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import type { Tenant as TenantRecord } from '@prisma/client';
import { Tenant, TenantStatus } from '../entities/tenant.entity';
import { TenantRepository } from '../interfaces/tenant-repository.interface';

@Injectable()
export class PrismaTenantRepository implements TenantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenant: Tenant): Promise<Tenant> {
    const record = await this.prisma.tenant.create({
      data: {
        id: tenant.id,
        name: tenant.name,
        status: tenant.status,
      },
    });
    return this.toDomain(record);
  }

  async findById(id: string): Promise<Tenant | null> {
    const record = await this.prisma.tenant.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findAll(): Promise<Tenant[]> {
    const records = await this.prisma.tenant.findMany({ orderBy: { createdAt: 'asc' } });
    return records.map((record) => this.toDomain(record));
  }

  async save(tenant: Tenant): Promise<Tenant> {
    const record = await this.prisma.tenant.update({
      where: { id: tenant.id },
      data: { name: tenant.name, status: tenant.status },
    });
    return this.toDomain(record);
  }

  private toDomain(record: TenantRecord): Tenant {
    return Tenant.restore({
      id: record.id,
      name: record.name,
      status: record.status as TenantStatus,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
