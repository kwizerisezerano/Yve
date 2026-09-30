import type { AdaptersClient } from '../../../shared/clients/adapters.client';
import { ServiceUnavailableDomainException } from '../../../shared/common/exceptions/service-unavailable.exception';
import type { RabbitmqPublisherService } from '../../../shared/rabbitmq/rabbitmq-publisher.service';
import { RoutingDecisionStatus } from '../entities/routing-decision.entity';
import type { EligibleProvider, RoutingPolicyService } from './routing-policy.service';
import type { RoutingDecisionService } from './routing-decision.service';
import { RoutingService } from './routing.service';

function candidate(provider: string, priority: number, cost: number | null = null): EligibleProvider {
  return { provider, priority, cost };
}

function setup() {
  const policy = { eligibleProviders: jest.fn() } as unknown as jest.Mocked<RoutingPolicyService>;
  const decisions = { record: jest.fn(), findByMessageId: jest.fn() } as unknown as jest.Mocked<RoutingDecisionService>;
  const adaptersClient = { getProviderHealth: jest.fn() } as unknown as jest.Mocked<AdaptersClient>;
  const publisher = { publish: jest.fn() } as unknown as jest.Mocked<RabbitmqPublisherService>;
  const service = new RoutingService(policy, decisions, adaptersClient, publisher);
  return { policy, decisions, adaptersClient, publisher, service };
}

describe('RoutingService', () => {
  it('selects the first healthy candidate and records it selected', async () => {
    const { policy, decisions, adaptersClient, publisher, service } = setup();
    policy.eligibleProviders.mockResolvedValue([candidate('provider-a', 10)]);
    adaptersClient.getProviderHealth.mockResolvedValue({ provider: 'provider-a', available: true });

    const result = await service.route('m1', { recipient: '+15551234567', type: 'sms' });

    expect(result).toEqual({ provider: 'provider-a' });
    expect(decisions.record).toHaveBeenCalledWith({
      messageId: 'm1',
      provider: 'provider-a',
      status: RoutingDecisionStatus.SELECTED,
      reason: null,
      cost: null,
      health: 'healthy',
    });
    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'routing.decision_made',
        messageId: 'm1',
        provider: 'provider-a',
        status: RoutingDecisionStatus.SELECTED,
      }),
    );
  });

  it('passes the country derived from the recipient and the given type to the policy', async () => {
    const { policy, adaptersClient, service } = setup();
    policy.eligibleProviders.mockResolvedValue([candidate('provider-a', 10)]);
    adaptersClient.getProviderHealth.mockResolvedValue({ provider: 'provider-a', available: true });

    await service.route('m1', { recipient: '+250783503691', type: 'sms' });

    expect(policy.eligibleProviders).toHaveBeenCalledWith({ country: 'RW', operator: null, type: 'sms' });
  });

  it('rejects an unavailable candidate and falls through to the next one', async () => {
    const { policy, decisions, adaptersClient, service } = setup();
    policy.eligibleProviders.mockResolvedValue([candidate('provider-down', 20), candidate('provider-up', 10)]);
    adaptersClient.getProviderHealth.mockImplementation((provider) =>
      Promise.resolve({ provider, available: provider === 'provider-up' }),
    );

    const result = await service.route('m1', { recipient: '+15551234567', type: 'sms' });

    expect(result).toEqual({ provider: 'provider-up' });
    expect(decisions.record).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'provider-down', status: RoutingDecisionStatus.REJECTED }),
    );
    expect(decisions.record).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'provider-up', status: RoutingDecisionStatus.SELECTED }),
    );
  });

  it('records a remaining untried candidate as eligible once a higher priority one is selected', async () => {
    const { decisions, policy, adaptersClient, service } = setup();
    policy.eligibleProviders.mockResolvedValue([candidate('provider-a', 20), candidate('provider-b', 10)]);
    adaptersClient.getProviderHealth.mockResolvedValue({ provider: 'provider-a', available: true });

    await service.route('m1', { recipient: '+15551234567', type: 'sms' });

    expect(adaptersClient.getProviderHealth).toHaveBeenCalledTimes(1);
    expect(decisions.record).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'provider-b', status: RoutingDecisionStatus.ELIGIBLE, health: null }),
    );
  });

  it('treats a health check error as unavailable rather than throwing', async () => {
    const { adaptersClient, decisions, policy, service } = setup();
    policy.eligibleProviders.mockResolvedValue([candidate('provider-a', 10)]);
    adaptersClient.getProviderHealth.mockRejectedValue(new Error('network down'));

    await expect(service.route('m1', { recipient: '+15551234567', type: 'sms' })).rejects.toBeInstanceOf(
      ServiceUnavailableDomainException,
    );
    expect(decisions.record).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'provider-a', status: RoutingDecisionStatus.REJECTED }),
    );
  });

  it('throws ServiceUnavailableDomainException and publishes a rejected event when no candidate is eligible', async () => {
    const { policy, decisions, publisher, service } = setup();
    policy.eligibleProviders.mockResolvedValue([]);

    await expect(service.route('m1', { recipient: '+15551234567', type: 'sms' })).rejects.toBeInstanceOf(
      ServiceUnavailableDomainException,
    );
    expect(decisions.record).not.toHaveBeenCalled();
    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({ messageId: 'm1', provider: null, status: RoutingDecisionStatus.REJECTED }),
    );
  });

  it('throws ServiceUnavailableDomainException when every candidate is unavailable', async () => {
    const { policy, adaptersClient, service } = setup();
    policy.eligibleProviders.mockResolvedValue([candidate('provider-a', 10), candidate('provider-b', 5)]);
    adaptersClient.getProviderHealth.mockResolvedValue({ provider: 'x', available: false });

    await expect(service.route('m1', { recipient: '+15551234567', type: 'sms' })).rejects.toBeInstanceOf(
      ServiceUnavailableDomainException,
    );
  });
});
