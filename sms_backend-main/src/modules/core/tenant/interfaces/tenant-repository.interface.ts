import { createInjectionToken } from '../../../../shared/common/tokens/injection-token';
import { Tenant } from '../entities/tenant.entity';

export interface TenantRepository {
  create(tenant: Tenant): Promise<Tenant>;
  findById(id: string): Promise<Tenant | null>;
  findAll(): Promise<Tenant[]>;
  save(tenant: Tenant): Promise<Tenant>;
}

export const TENANT_REPOSITORY = createInjectionToken<TenantRepository>('TENANT_REPOSITORY');
