import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { Pricing } from '../entities/pricing.entity';
import { PricingRepository } from '../interfaces/pricing-repository.interface';

@Injectable()
export class PrismaPricingRepository implements PricingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(p: Pricing): Promise<Pricing> {
    const r = await this.prisma.pricing.create({
      data: { id: p.id, tenantId: p.tenantId, country: p.country, operator: p.operator, customerPrice: p.customerPrice, providerCost: p.providerCost, currency: p.currency },
    });
    return this.toDomain(r);
  }

  async findByTenantAndRoute(tenantId: string, country: string, operator: string): Promise<Pricing | null> {
    const r = await this.prisma.pricing.findUnique({ where: { tenantId_country_operator: { tenantId, country, operator } } });
    return r ? this.toDomain(r) : null;
  }

  async findGlobalRoute(country: string, operator: string): Promise<Pricing | null> {
    const r = await this.prisma.pricing.findFirst({ where: { tenantId: null, country, operator } });
    return r ? this.toDomain(r) : null;
  }

  async findAllByTenant(tenantId: string | null): Promise<Pricing[]> {
    const records = await this.prisma.pricing.findMany({ where: { tenantId }, orderBy: { country: 'asc' } });
    return records.map((r) => this.toDomain(r));
  }

  private toDomain(r: any): Pricing {
    return Pricing.restore({ id: r.id, tenantId: r.tenantId, country: r.country, operator: r.operator, customerPrice: Number(r.customerPrice), providerCost: Number(r.providerCost), currency: r.currency, createdAt: r.createdAt, updatedAt: r.updatedAt });
  }
}
