import { Pricing } from '../entities/pricing.entity';

export const PRICING_REPOSITORY = 'PRICING_REPOSITORY';

export interface PricingRepository {
  create(pricing: Pricing): Promise<Pricing>;
  findByTenantAndRoute(tenantId: string, country: string, operator: string): Promise<Pricing | null>;
  findGlobalRoute(country: string, operator: string): Promise<Pricing | null>;
  findAllByTenant(tenantId: string | null): Promise<Pricing[]>;
}
