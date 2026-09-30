import { NotFoundDomainException } from '../../../shared/common/exceptions/not-found.exception';
import { Provider, ProviderStatus } from '../entities/provider.entity';
import type { ProviderRepository } from '../interfaces/provider.repository.interface';
import { ProviderService } from './provider.service';

function createProvider(): Provider {
  return new Provider({
    id: 'p1',
    name: 'mtn',
    description: 'MTN Rwanda',
    defaultCost: 0.02,
    status: ProviderStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function setup() {
  const repository: jest.Mocked<ProviderRepository> = {
    create: jest.fn(),
    findById: jest.fn(),
    findByIds: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const service = new ProviderService(repository);
  return { repository, service };
}

describe('ProviderService', () => {
  it('create builds a provider with sensible defaults for optional fields', async () => {
    const { repository, service } = setup();
    repository.create.mockImplementation((provider) => Promise.resolve(provider));

    const result = await service.create({ name: 'mtn' });

    expect(repository.create).toHaveBeenCalledTimes(1);
    const persisted = repository.create.mock.calls[0][0];
    expect(persisted.description).toBeNull();
    expect(persisted.defaultCost).toBeNull();
    expect(persisted.status).toBe(ProviderStatus.ACTIVE);
    expect(result.name).toBe('mtn');
  });

  it('findAll delegates to the repository', async () => {
    const { repository, service } = setup();
    repository.findAll.mockResolvedValue([createProvider()]);

    const result = await service.findAll();

    expect(result).toHaveLength(1);
  });

  it('findById returns the provider when it exists', async () => {
    const { repository, service } = setup();
    const provider = createProvider();
    repository.findById.mockResolvedValue(provider);

    const result = await service.findById('p1');

    expect(result).toBe(provider);
  });

  it('findById throws NotFoundDomainException when the provider does not exist', async () => {
    const { repository, service } = setup();
    repository.findById.mockResolvedValue(null);

    await expect(service.findById('missing')).rejects.toBeInstanceOf(NotFoundDomainException);
  });

  it('findByIds delegates to the repository', async () => {
    const { repository, service } = setup();
    repository.findByIds.mockResolvedValue([createProvider()]);

    const result = await service.findByIds(['p1']);

    expect(repository.findByIds).toHaveBeenCalledWith(['p1']);
    expect(result).toHaveLength(1);
  });

  it('update applies the changes through the entity and persists the result', async () => {
    const { repository, service } = setup();
    const provider = createProvider();
    repository.findById.mockResolvedValue(provider);
    repository.update.mockImplementation((p) => Promise.resolve(p));

    const result = await service.update('p1', { defaultCost: 0.05 });

    expect(repository.update).toHaveBeenCalledTimes(1);
    const updated = repository.update.mock.calls[0][0];
    expect(updated.defaultCost).toBe(0.05);
    expect(updated).not.toBe(provider);
    expect(result.defaultCost).toBe(0.05);
  });

  it('update throws NotFoundDomainException when the provider does not exist', async () => {
    const { repository, service } = setup();
    repository.findById.mockResolvedValue(null);

    await expect(service.update('missing', { defaultCost: 1 })).rejects.toBeInstanceOf(
      NotFoundDomainException,
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('delete checks existence first, then delegates to the repository', async () => {
    const { repository, service } = setup();
    repository.findById.mockResolvedValue(createProvider());

    await service.delete('p1');

    expect(repository.delete).toHaveBeenCalledWith('p1');
  });

  it('delete throws NotFoundDomainException without calling the repository delete when missing', async () => {
    const { repository, service } = setup();
    repository.findById.mockResolvedValue(null);

    await expect(service.delete('missing')).rejects.toBeInstanceOf(NotFoundDomainException);
    expect(repository.delete).not.toHaveBeenCalled();
  });
});
