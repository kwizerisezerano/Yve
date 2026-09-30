import { NotFoundDomainException } from '../../../shared/common/exceptions/not-found.exception';
import { Provider, ProviderStatus } from '../../provider/entities/provider.entity';
import type { ProviderService } from '../../provider/services/provider.service';
import { RoutingRule, RoutingRuleAction, RoutingRuleStatus } from '../entities/routing-rule.entity';
import type { RoutingRuleRepository } from '../interfaces/routing-rule.repository.interface';
import { RoutingRuleService } from './routing-rule.service';

function createRule(): RoutingRule {
  return new RoutingRule({
    id: 'r1',
    country: 'RW',
    operator: null,
    type: 'sms',
    providerId: 'p1',
    action: RoutingRuleAction.ALLOW,
    priority: 10,
    cost: 0.02,
    status: RoutingRuleStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function createProvider(): Provider {
  return new Provider({
    id: 'p1',
    name: 'provider-a',
    description: null,
    defaultCost: null,
    status: ProviderStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function setup() {
  const repository: jest.Mocked<RoutingRuleRepository> = {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    findActive: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const providers = {
    findById: jest.fn().mockResolvedValue(createProvider()),
  } as unknown as jest.Mocked<ProviderService>;
  const service = new RoutingRuleService(repository, providers);
  return { repository, providers, service };
}

describe('RoutingRuleService', () => {
  it('create builds a rule with sensible defaults for optional fields', async () => {
    const { repository, providers, service } = setup();
    repository.create.mockImplementation((rule) => Promise.resolve(rule));

    const result = await service.create({ providerId: 'p1' });

    expect(providers.findById).toHaveBeenCalledWith('p1');
    expect(repository.create).toHaveBeenCalledTimes(1);
    const persisted = repository.create.mock.calls[0][0];
    expect(persisted.country).toBeNull();
    expect(persisted.operator).toBeNull();
    expect(persisted.type).toBeNull();
    expect(persisted.action).toBe(RoutingRuleAction.ALLOW);
    expect(persisted.priority).toBe(0);
    expect(persisted.cost).toBeNull();
    expect(persisted.status).toBe(RoutingRuleStatus.ACTIVE);
    expect(result.providerId).toBe('p1');
  });

  it('create uses the given fields when provided', async () => {
    const { repository, service } = setup();
    repository.create.mockImplementation((rule) => Promise.resolve(rule));

    await service.create({
      providerId: 'p1',
      country: 'RW',
      type: 'sms',
      action: RoutingRuleAction.BLOCK,
      priority: 50,
      cost: 0.05,
    });

    const persisted = repository.create.mock.calls[0][0];
    expect(persisted.country).toBe('RW');
    expect(persisted.type).toBe('sms');
    expect(persisted.action).toBe(RoutingRuleAction.BLOCK);
    expect(persisted.priority).toBe(50);
    expect(persisted.cost).toBe(0.05);
  });

  it('findAll delegates to the repository', async () => {
    const { repository, service } = setup();
    repository.findAll.mockResolvedValue([createRule()]);

    const result = await service.findAll();

    expect(result).toHaveLength(1);
  });

  it('findById throws NotFoundDomainException when the rule does not exist', async () => {
    const { repository, service } = setup();
    repository.findById.mockResolvedValue(null);

    await expect(service.findById('missing')).rejects.toBeInstanceOf(NotFoundDomainException);
  });

  it('update applies the changes through the entity and persists the result', async () => {
    const { repository, service } = setup();
    const rule = createRule();
    repository.findById.mockResolvedValue(rule);
    repository.update.mockImplementation((r) => Promise.resolve(r));

    const result = await service.update('r1', { priority: 99, status: RoutingRuleStatus.DISABLED });

    expect(repository.update).toHaveBeenCalledTimes(1);
    const updated = repository.update.mock.calls[0][0];
    expect(updated.priority).toBe(99);
    expect(updated.status).toBe(RoutingRuleStatus.DISABLED);
    expect(updated).not.toBe(rule);
    expect(result.priority).toBe(99);
  });

  it('update throws NotFoundDomainException when the rule does not exist', async () => {
    const { repository, service } = setup();
    repository.findById.mockResolvedValue(null);

    await expect(service.update('missing', { priority: 1 })).rejects.toBeInstanceOf(
      NotFoundDomainException,
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('delete checks existence first, then delegates to the repository', async () => {
    const { repository, service } = setup();
    repository.findById.mockResolvedValue(createRule());

    await service.delete('r1');

    expect(repository.delete).toHaveBeenCalledWith('r1');
  });

  it('delete throws NotFoundDomainException without calling the repository delete when missing', async () => {
    const { repository, service } = setup();
    repository.findById.mockResolvedValue(null);

    await expect(service.delete('missing')).rejects.toBeInstanceOf(NotFoundDomainException);
    expect(repository.delete).not.toHaveBeenCalled();
  });
});
