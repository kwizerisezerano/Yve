import { RoutingRule, RoutingRuleAction, RoutingRuleStatus } from './routing-rule.entity';

function createRule(overrides: Partial<{
  country: string | null;
  operator: string | null;
  type: string | null;
  status: RoutingRuleStatus;
}> = {}): RoutingRule {
  return new RoutingRule({
    id: 'r1',
    country: overrides.country ?? null,
    operator: overrides.operator ?? null,
    type: overrides.type ?? null,
    providerId: 'p1',
    action: RoutingRuleAction.ALLOW,
    priority: 10,
    cost: null,
    status: overrides.status ?? RoutingRuleStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('RoutingRule', () => {
  it('isActive reflects the status', () => {
    expect(createRule({ status: RoutingRuleStatus.ACTIVE }).isActive()).toBe(true);
    expect(createRule({ status: RoutingRuleStatus.DISABLED }).isActive()).toBe(false);
  });

  it('a wildcard rule (all fields null) matches any criteria', () => {
    const rule = createRule();

    expect(rule.matches({ country: 'RW', operator: 'MTN', type: 'sms' })).toBe(true);
    expect(rule.matches({ country: null, operator: null, type: 'promo' })).toBe(true);
  });

  it('a rule with a specific field only matches criteria with the same value', () => {
    const rule = createRule({ country: 'RW' });

    expect(rule.matches({ country: 'RW', operator: null, type: 'sms' })).toBe(true);
    expect(rule.matches({ country: 'KE', operator: null, type: 'sms' })).toBe(false);
  });

  it('a rule with multiple specific fields requires all of them to match', () => {
    const rule = createRule({ country: 'RW', type: 'sms' });

    expect(rule.matches({ country: 'RW', operator: null, type: 'sms' })).toBe(true);
    expect(rule.matches({ country: 'RW', operator: null, type: 'promo' })).toBe(false);
  });
});
