import { Inject, Injectable } from '@nestjs/common';
import { hashApiKey } from '../../../shared/common/api-key';
import { UnauthorizedDomainException } from '../../../shared/common/exceptions/unauthorized.exception';
import { AuthContext } from '../interfaces/auth-context.interface';
import {
  TENANT_REPOSITORY,
  type TenantRepository,
} from '../interfaces/tenant.repository.interface';

@Injectable()
export class AuthService {
  constructor(@Inject(TENANT_REPOSITORY) private readonly tenants: TenantRepository) {}

  async authenticate(rawKey: string | undefined): Promise<AuthContext> {
    if (!rawKey) {
      throw new UnauthorizedDomainException('Missing api key or token.');
    }

    const tenant = await this.tenants.findByApiKeyHash(hashApiKey(rawKey));
    if (!tenant || !tenant.isActive()) {
      throw new UnauthorizedDomainException('Invalid api key or token.');
    }

    return {
      tenantId: tenant.id,
      defaultSender: tenant.defaultSender,
    };
  }
}
