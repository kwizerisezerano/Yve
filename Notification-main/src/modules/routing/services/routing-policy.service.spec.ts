import { Provider, ProviderStatus } from '../../provider/entities/provider.entity';
import type { ProviderService } from '../../provider/services/provider.service';
import { RoutingRule, RoutingRuleAction, RoutingRuleStatus } from '../entities/routing-rule.entity';
import type { RoutingRuleRepository } from '../interfaces/routing-rule.repository.interface';
import { RoutingPolicyService } from './routing-policy.service';

function createRule(props: {
  id: string;
  country?: string | null;
  operator?: string | null;
  type?: string | null;
  providerId: string;
  action?: RoutingRuleAction;
  priority?: number;
  cost?: number | null;
}): RoutingRule {
  return new RoutingRule({
    id: props.id,
    country: props.country ?? null,
    operator: props.operator ?? null,
    type: props.type ?? null,
    providerId: props.providerId,
    action: props.action ?? RoutingRuleAction.ALLOW,
    priority: props.priority ?? 0,
    cost: props.cost ?? null,
    status: RoutingRuleStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function createProvider(props: {
  id: string;
  name: string;
  defaultCost?: number | null;
  status?: ProviderStatus;
}): Provider {
  return new Provider({
    id: props.id,
    name: props.name,
    description: null,
    defaultCost: props.defaultCost ?? null,
    status: props.status ?? ProviderStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function setup(rules: RoutingRule[], providers: Provider[]) {
  const repository: jest.Mocked<RoutingRuleRepository> = {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    findActive: jest.fn().mockResolvedValue(rules),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const providerService = {
    findByIds: jest.fn().mockResolvedValue(providers),
  } as unknown as jest.Mocked<ProviderService>;
  const service = new RoutingPolicyService(repository, providerService);
  return { repository, providerService, service };
}

describe('RoutingPolicyService', () => {
  it('returns an eligible provider that matches a wildcard allow rule', async () => {
    const { service } = setup(
      [createRule({ id: 'r1', providerId: 'p1', priority: 10 })],
      [createProvider({ id: 'p1', name: 'provider-a' })],
    );

    const result = await service.eligibleProviders({ country: 'RW', operator: null, type: 'sms' });

    expect(result).toEqual([{ provider: 'provider-a', priority: 10, cost: null }]);
  });

  it('orders eligible providers by priority, highest first', async () => {
    const { service } = setup(
      [
        createRule({ id: 'r1', providerId: 'p-low', priority: 5 }),
        createRule({ id: 'r2', providerId: 'p-high', priority: 50 }),
        createRule({ id: 'r3', providerId: 'p-mid', priority: 20 }),
      ],
      [
        createProvider({ id: 'p-low', name: 'provider-low' }),
        createProvider({ id: 'p-high', name: 'provider-high' }),
        createProvider({ id: 'p-mid', name: 'provider-mid' }),
      ],
    );

    const result = await service.eligibleProviders({ country: null, operator: null, type: 'sms' });

    expect(result.map((c) => c.provider)).toEqual(['provider-high', 'provider-mid', 'provider-low']);
  });

  it('excludes a provider named by any matching block rule, even if an allow rule also names it', async () => {
    const { service } = setup(
      [
        createRule({ id: 'r1', providerId: 'p1', priority: 100, action: RoutingRuleAction.ALLOW }),
        createRule({ id: 'r2', providerId: 'p1', action: RoutingRuleAction.BLOCK, country: 'RW' }),
      ],
      [createProvider({ id: 'p1', name: 'provider-a' })],
    );

    const result = await service.eligibleProviders({ country: 'RW', operator: null, type: 'sms' });

    expect(result).toEqual([]);
  });

  it('does not filter out a provider whose block rule does not match the criteria', async () => {
    const { service } = setup(
      [
        createRule({ id: 'r1', providerId: 'p1', priority: 100 }),
        createRule({ id: 'r2', providerId: 'p1', action: RoutingRuleAction.BLOCK, country: 'KE' }),
      ],
      [createProvider({ id: 'p1', name: 'provider-a' })],
    );

    const result = await service.eligibleProviders({ country: 'RW', operator: null, type: 'sms' });

    expect(result.map((c) => c.provider)).toEqual(['provider-a']);
  });

  it('excludes rules that do not match the criteria', async () => {
    const { service } = setup(
      [createRule({ id: 'r1', providerId: 'p1', country: 'KE' })],
      [createProvider({ id: 'p1', name: 'provider-a' })],
    );

    const result = await service.eligibleProviders({ country: 'RW', operator: null, type: 'sms' });

    expect(result).toEqual([]);
  });

  it('keeps only the highest priority allow rule per provider when several match', async () => {
    const { service } = setup(
      [
        createRule({ id: 'r1', providerId: 'p1', priority: 10, type: 'sms' }),
        createRule({ id: 'r2', providerId: 'p1', priority: 40, type: null }),
      ],
      [createProvider({ id: 'p1', name: 'provider-a' })],
    );

    const result = await service.eligibleProviders({ country: null, operator: null, type: 'sms' });

    expect(result).toEqual([{ provider: 'provider-a', priority: 40, cost: null }]);
  });

  it('returns an empty list when no rule matches', async () => {
    const { service } = setup([], []);

    const result = await service.eligibleProviders({ country: 'RW', operator: null, type: 'sms' });

    expect(result).toEqual([]);
  });

  it('excludes a rule whose provider is disabled, even though the rule itself is active', async () => {
    const { service } = setup(
      [createRule({ id: 'r1', providerId: 'p1', priority: 10 })],
      [createProvider({ id: 'p1', name: 'provider-a', status: ProviderStatus.DISABLED })],
    );

    const result = await service.eligibleProviders({ country: 'RW', operator: null, type: 'sms' });

    expect(result).toEqual([]);
  });

  it('falls back to the provider default cost when the rule does not set its own', async () => {
    const { service } = setup(
      [createRule({ id: 'r1', providerId: 'p1', priority: 10, cost: null })],
      [createProvider({ id: 'p1', name: 'provider-a', defaultCost: 0.02 })],
    );

    const result = await service.eligibleProviders({ country: 'RW', operator: null, type: 'sms' });

    expect(result).toEqual([{ provider: 'provider-a', priority: 10, cost: 0.02 }]);
  });

  it('prefers the rule cost over the provider default cost when both are set', async () => {
    const { service } = setup(
      [createRule({ id: 'r1', providerId: 'p1', priority: 10, cost: 0.05 })],
      [createProvider({ id: 'p1', name: 'provider-a', defaultCost: 0.02 })],
    );

    const result = await service.eligibleProviders({ country: 'RW', operator: null, type: 'sms' });

    expect(result).toEqual([{ provider: 'provider-a', priority: 10, cost: 0.05 }]);
  });
});
