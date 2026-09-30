import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/common/exceptions/entity-not-found.exception';
import { Pricing } from '../entities/pricing.entity';
import { PRICING_REPOSITORY, PricingRepository } from '../interfaces/pricing-repository.interface';

@Injectable()
export class PricingService {
  constructor(@Inject(PRICING_REPOSITORY) private readonly pricingRepository: PricingRepository) {}

  async resolve(tenantId: string, country: string, operator: string): Promise<Pricing> {
    // Tenant-specific first, then global fallback
    const tenantPrice = await this.pricingRepository.findByTenantAndRoute(tenantId, country, operator);
    if (tenantPrice) return tenantPrice;
    const global = await this.pricingRepository.findGlobalRoute(country, operator);
    if (!global) throw new EntityNotFoundException('Pricing', `${country}/${operator}`);
    return global;
  }

  async listForTenant(tenantId: string): Promise<Pricing[]> {
    const tenant = await this.pricingRepository.findAllByTenant(tenantId);
    const global = await this.pricingRepository.findAllByTenant(null);
    return [...tenant, ...global];
  }

  async create(tenantId: string | null, country: string, operator: string, customerPrice: number, providerCost: number): Promise<Pricing> {
    const pricing = Pricing.create(tenantId, country, operator, customerPrice, providerCost);
    return this.pricingRepository.create(pricing);
  }
}
