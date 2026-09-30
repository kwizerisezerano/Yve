import { randomUUID } from 'node:crypto';
import { BaseEntity } from '../../../../shared/common/entities/base.entity';

export interface PricingProps {
  id: string;
  tenantId: string | null;
  country: string;
  operator: string;
  customerPrice: number;
  providerCost: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Pricing extends BaseEntity {
  private constructor(
    id: string,
    public readonly tenantId: string | null,
    public readonly country: string,
    public readonly operator: string,
    public customerPrice: number,
    public providerCost: number,
    public readonly currency: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(tenantId: string | null, country: string, operator: string, customerPrice: number, providerCost: number, currency = 'RWF'): Pricing {
    const now = new Date();
    return new Pricing(randomUUID(), tenantId, country, operator, customerPrice, providerCost, currency, now, now);
  }

  static restore(props: PricingProps): Pricing {
    return new Pricing(props.id, props.tenantId, props.country, props.operator, props.customerPrice, props.providerCost, props.currency, props.createdAt, props.updatedAt);
  }

  get margin(): number {
    return this.customerPrice - this.providerCost;
  }
}
