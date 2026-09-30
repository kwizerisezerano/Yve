import { NotFoundDomainException } from '../../../shared/common/exceptions/not-found.exception';
import { Tenant, TenantStatus } from '../entities/tenant.entity';
import type { TenantRepository } from '../interfaces/tenant.repository.interface';
import { TenantService } from './tenant.service';

function createTenant(): Tenant {
  return new Tenant({
    id: 't1',
    name: 'Acme',
    phone: '+15551234567',
    apiKeyHash: 'hash-1',
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
  const service = new TenantService(repository);
  return { repository, service };
}

describe('TenantService', () => {
  it('findAll delegates to the repository', async () => {
    const { repository, service } = setup();
    repository.findAll.mockResolvedValue([createTenant()]);

    const result = await service.findAll();

    expect(result).toHaveLength(1);
  });

  it('findById returns the tenant when it exists', async () => {
    const { repository, service } = setup();
    const tenant = createTenant();
    repository.findById.mockResolvedValue(tenant);

    const result = await service.findById('t1');

    expect(result).toBe(tenant);
  });

  it('findById throws NotFoundDomainException when the tenant does not exist', async () => {
    const { repository, service } = setup();
    repository.findById.mockResolvedValue(null);

    await expect(service.findById('missing')).rejects.toBeInstanceOf(NotFoundDomainException);
  });

  it('update applies the changes through the entity and persists the result', async () => {
    const { repository, service } = setup();
    const tenant = createTenant();
    repository.findById.mockResolvedValue(tenant);
    repository.update.mockImplementation((t) => Promise.resolve(t));

    const result = await service.update('t1', { name: 'New Name' });

    expect(repository.update).toHaveBeenCalledTimes(1);
    const updated = repository.update.mock.calls[0][0];
    expect(updated.name).toBe('New Name');
    expect(updated).not.toBe(tenant);
    expect(result.name).toBe('New Name');
  });

  it('update throws NotFoundDomainException when the tenant does not exist', async () => {
    const { repository, service } = setup();
    repository.findById.mockResolvedValue(null);

    await expect(service.update('missing', { name: 'X' })).rejects.toBeInstanceOf(
      NotFoundDomainException,
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('delete checks existence first, then delegates to the repository', async () => {
    const { repository, service } = setup();
    repository.findById.mockResolvedValue(createTenant());

    await service.delete('t1');

    expect(repository.delete).toHaveBeenCalledWith('t1');
  });

  it('delete throws NotFoundDomainException without calling the repository delete when missing', async () => {
    const { repository, service } = setup();
    repository.findById.mockResolvedValue(null);

    await expect(service.delete('missing')).rejects.toBeInstanceOf(NotFoundDomainException);
    expect(repository.delete).not.toHaveBeenCalled();
  });
});
