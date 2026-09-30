import { NotFoundDomainException } from '../../../shared/common/exceptions/not-found.exception';
import { Tenant, TenantStatus } from '../entities/tenant.entity';
import type { TenantRepository } from '../interfaces/tenant.repository.interface';
import { TenantRegistrationService } from './tenant-registration.service';

function createTenant(): Tenant {
  return new Tenant({
    id: 't1',
    name: 'Acme',
    phone: '+15551234567',
    apiKeyHash: 'old-hash',
    defaultSender: 'ACME',
    webhookUrl: null,
    status: TenantStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function setup() {
  const repository: jest.Mocked<TenantRepository> = {
    create: jest.fn(),
    findById: jest.fn(),
    findByApiKeyHash: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const service = new TenantRegistrationService(repository);
  return { repository, service };
}

describe('TenantRegistrationService', () => {
  it('creates and persists a tenant with a freshly generated api key', async () => {
    const { repository, service } = setup();
    repository.create.mockImplementation((tenant) => Promise.resolve(tenant));

    const { tenant, rawApiKey } = await service.register({ name: 'Acme', phone: '+15551234567' });

    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(tenant.name).toBe('Acme');
    expect(tenant.phone).toBe('+15551234567');
    expect(tenant.defaultSender).toBe('+15551234567');
    expect(rawApiKey).toMatch(/^ntf_/);
    expect(tenant.apiKeyHash).not.toBe(rawApiKey);
  });

  it('uses the given defaultSender instead of falling back to the phone number', async () => {
    const { repository, service } = setup();
    repository.create.mockImplementation((tenant) => Promise.resolve(tenant));

    const { tenant } = await service.register({
      name: 'Acme',
      phone: '+15551234567',
      defaultSender: 'ACME',
    });

    expect(tenant.defaultSender).toBe('ACME');
  });

  it('regenerateKey issues a new key and persists it, leaving other fields untouched', async () => {
    const { repository, service } = setup();
    const tenant = createTenant();
    repository.findById.mockResolvedValue(tenant);
    repository.update.mockImplementation((t) => Promise.resolve(t));

    const { tenant: updated, rawApiKey } = await service.regenerateKey('t1');

    expect(repository.findById).toHaveBeenCalledWith('t1');
    expect(repository.update).toHaveBeenCalledTimes(1);
    const persisted = repository.update.mock.calls[0][0];
    expect(persisted.apiKeyHash).not.toBe('old-hash');
    expect(rawApiKey).toMatch(/^ntf_/);
    expect(updated.name).toBe('Acme');
  });

  it('regenerateKey throws NotFoundDomainException when the tenant does not exist', async () => {
    const { repository, service } = setup();
    repository.findById.mockResolvedValue(null);

    await expect(service.regenerateKey('missing')).rejects.toBeInstanceOf(NotFoundDomainException);
    expect(repository.update).not.toHaveBeenCalled();
  });
});
