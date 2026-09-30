import { RoutingDecision, RoutingDecisionStatus } from './routing-decision.entity';

describe('RoutingDecision', () => {
  it('create builds a decision with updatedAt equal to createdAt', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');

    const decision = RoutingDecision.create({
      id: 'd1',
      messageId: 'm1',
      provider: 'provider-a',
      status: RoutingDecisionStatus.SELECTED,
      reason: null,
      cost: 0.02,
      health: 'healthy',
      createdAt,
    });

    expect(decision.updatedAt).toEqual(createdAt);
    expect(decision.status).toBe(RoutingDecisionStatus.SELECTED);
    expect(decision.messageId).toBe('m1');
  });
});
