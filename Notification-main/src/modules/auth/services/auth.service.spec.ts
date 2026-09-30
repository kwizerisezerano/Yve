import { hashApiKey } from '../../../shared/common/api-key';
import { UnauthorizedDomainException } from '../../../shared/common/exceptions/unauthorized.exception';
import { Tenant, TenantStatus } from '../entities/tenant.entity';
import type { TenantRepository } from '../interfaces/tenant.repository.interface';
import { AuthService } from './auth.service';

function createTenant(status: TenantStatus): Tenant {
  return new Tenant({
    id: 't1',
    name: 'Acme',
    phone: '+15551234567',
    apiKeyHash: hashApiKey('raw-key'),
    defaultSender: 'ACME',
    webhookUrl: null,
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function setup() {
  const tenants: jest.Mocked<TenantRepository> = {
    create: jest.fn(),
    findById: jest.fn(),
    findByApiKeyHash: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const service = new AuthService(tenants);
  return { tenants, service };
}

describe('AuthService', () => {
  it('authenticates and returns an auth context when the key matches an active tenant', async () => {
    const { tenants, service } = setup();
    tenants.findByApiKeyHash.mockResolvedValue(createTenant(TenantStatus.ACTIVE));

    const result = await service.authenticate('raw-key');

    expect(tenants.findByApiKeyHash).toHaveBeenCalledWith(hashApiKey('raw-key'));
    expect(result).toEqual({ tenantId: 't1', defaultSender: 'ACME' });
  });

  it('rejects when no api key is given', async () => {
    const { service } = setup();

    await expect(service.authenticate(undefined)).rejects.toBeInstanceOf(UnauthorizedDomainException);
  });

  it('rejects when no tenant matches the hashed key', async () => {
    const { tenants, service } = setup();
    tenants.findByApiKeyHash.mockResolvedValue(null);

    await expect(service.authenticate('unknown-key')).rejects.toBeInstanceOf(
      UnauthorizedDomainException,
    );
  });

  it('rejects when the tenant is disabled', async () => {
    const { tenants, service } = setup();
    tenants.findByApiKeyHash.mockResolvedValue(createTenant(TenantStatus.DISABLED));

    await expect(service.authenticate('raw-key')).rejects.toBeInstanceOf(UnauthorizedDomainException);
  });
});
