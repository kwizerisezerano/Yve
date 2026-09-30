import { Inject, Injectable } from '@nestjs/common';
import { NotFoundDomainException } from '../../../shared/common/exceptions/not-found.exception';
import { Tenant, TenantStatus } from '../entities/tenant.entity';
import {
  TENANT_REPOSITORY,
  type TenantRepository,
} from '../interfaces/tenant.repository.interface';

export interface UpdateTenantInput {
  name?: string;
  phone?: string;
  defaultSender?: string;
  webhookUrl?: string | null;
  status?: TenantStatus;
}

@Injectable()
export class TenantService {
  constructor(@Inject(TENANT_REPOSITORY) private readonly repository: TenantRepository) {}

  findAll(): Promise<Tenant[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<Tenant> {
    const tenant = await this.repository.findById(id);
    if (!tenant) {
      throw new NotFoundDomainException(`Tenant ${id} not found.`);
    }
    return tenant;
  }

  async update(id: string, changes: UpdateTenantInput): Promise<Tenant> {
    const tenant = await this.findById(id);
    return this.repository.update(tenant.withUpdates(changes));
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }
}
