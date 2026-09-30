import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { Provider, ProviderCapabilities } from '../entities/provider.entity';
import { ProviderRepository } from '../interfaces/provider-repository.interface';

@Injectable()
export class PrismaProviderRepository implements ProviderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(p: Provider): Promise<Provider> {
    const r = await this.prisma.provider.create({
      data: { id: p.id, name: p.name, code: p.code, isActive: p.isActive, capabilities: p.capabilities as any, metadata: p.metadata as any },
    });
    return this.toDomain(r);
  }

  async findById(id: string): Promise<Provider | null> {
    const r = await this.prisma.provider.findUnique({ where: { id } });
    return r ? this.toDomain(r) : null;
  }

  async findByCode(code: string): Promise<Provider | null> {
    const r = await this.prisma.provider.findUnique({ where: { code } });
    return r ? this.toDomain(r) : null;
  }

  async findAll(): Promise<Provider[]> {
    return (await this.prisma.provider.findMany({ orderBy: { name: 'asc' } })).map((r) => this.toDomain(r));
  }

  async findActive(): Promise<Provider[]> {
    return (await this.prisma.provider.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })).map((r) => this.toDomain(r));
  }

  async save(p: Provider): Promise<Provider> {
    const r = await this.prisma.provider.update({ where: { id: p.id }, data: { name: p.name, isActive: p.isActive, capabilities: p.capabilities as any, metadata: p.metadata as any } });
    return this.toDomain(r);
  }

  private toDomain(r: any): Provider {
    return Provider.restore({ id: r.id, name: r.name, code: r.code, isActive: r.isActive, capabilities: (r.capabilities ?? {}) as ProviderCapabilities, metadata: (r.metadata ?? {}) as Record<string, unknown>, createdAt: r.createdAt, updatedAt: r.updatedAt });
  }
}
