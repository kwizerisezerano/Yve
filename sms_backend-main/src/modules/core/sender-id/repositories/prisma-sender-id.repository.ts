import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import type { SenderID as SenderIDRecord } from '@prisma/client';
import { SenderID, SenderIdStatus } from '../entities/sender-id.entity';
import { SenderIdRepository } from '../interfaces/sender-id-repository.interface';

@Injectable()
export class PrismaSenderIdRepository implements SenderIdRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(s: SenderID): Promise<SenderID> {
    const r = await this.prisma.senderID.create({
      data: { id: s.id, tenantId: s.tenantId, name: s.name, status: s.status, approvedAt: s.approvedAt, rejectedAt: s.rejectedAt },
    });
    return this.toDomain(r);
  }

  async findById(id: string): Promise<SenderID | null> {
    const r = await this.prisma.senderID.findUnique({ where: { id } });
    return r ? this.toDomain(r) : null;
  }

  async findByName(tenantId: string, name: string): Promise<SenderID | null> {
    const r = await this.prisma.senderID.findUnique({ where: { tenantId_name: { tenantId, name } } });
    return r ? this.toDomain(r) : null;
  }

  async findAllByTenant(tenantId: string): Promise<SenderID[]> {
    const records = await this.prisma.senderID.findMany({ where: { tenantId }, orderBy: { createdAt: 'asc' } });
    return records.map((r) => this.toDomain(r));
  }

  async save(s: SenderID): Promise<SenderID> {
    const r = await this.prisma.senderID.update({
      where: { id: s.id },
      data: { status: s.status, approvedAt: s.approvedAt, rejectedAt: s.rejectedAt },
    });
    return this.toDomain(r);
  }

  private toDomain(r: SenderIDRecord): SenderID {
    return SenderID.restore({ id: r.id, tenantId: r.tenantId, name: r.name, status: r.status as SenderIdStatus, approvedAt: r.approvedAt, rejectedAt: r.rejectedAt, createdAt: r.createdAt, updatedAt: r.updatedAt });
  }
}
