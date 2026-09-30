import { Tenant } from '../entities/tenant.entity';

export const TENANT_REPOSITORY = Symbol('TENANT_REPOSITORY');

export interface TenantRepository {
  create(tenant: Tenant): Promise<Tenant>;
  findById(id: string): Promise<Tenant | null>;
  findByApiKeyHash(apiKeyHash: string): Promise<Tenant | null>;
  findAll(): Promise<Tenant[]>;
  update(tenant: Tenant): Promise<Tenant>;
  delete(id: string): Promise<void>;
}
