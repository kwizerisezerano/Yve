import { randomUUID } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { generateApiKey, hashApiKey } from '../../../shared/common/api-key';
import { NotFoundDomainException } from '../../../shared/common/exceptions/not-found.exception';
import { Tenant } from '../entities/tenant.entity';
import {
  TENANT_REPOSITORY,
  type TenantRepository,
} from '../interfaces/tenant.repository.interface';

export interface RegisterTenantInput {
  name: string;
  phone: string;
  defaultSender?: string;
}

export interface RegisterTenantResult {
  tenant: Tenant;
  rawApiKey: string;
}

@Injectable()
export class TenantRegistrationService {
  constructor(@Inject(TENANT_REPOSITORY) private readonly repository: TenantRepository) {}

  async register(input: RegisterTenantInput): Promise<RegisterTenantResult> {
    const rawApiKey = generateApiKey();
    const tenant = Tenant.create({
      id: randomUUID(),
      name: input.name,
      phone: input.phone,
      apiKeyHash: hashApiKey(rawApiKey),
      defaultSender: input.defaultSender ?? input.phone,
      createdAt: new Date(),
    });

    const created = await this.repository.create(tenant);
    return { tenant: created, rawApiKey };
  }

  async regenerateKey(tenantId: string): Promise<RegisterTenantResult> {
    const tenant = await this.repository.findById(tenantId);
    if (!tenant) {
      throw new NotFoundDomainException(`Tenant ${tenantId} not found.`);
    }

    const rawApiKey = generateApiKey();
    const updated = await this.repository.update(tenant.withNewApiKey(hashApiKey(rawApiKey)));
    return { tenant: updated, rawApiKey };
  }
}
