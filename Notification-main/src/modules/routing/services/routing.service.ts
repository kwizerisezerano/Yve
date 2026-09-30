import { Injectable } from '@nestjs/common';
import { AdaptersClient } from '../../../shared/clients/adapters.client';
import { ActivityLogger } from '../../../shared/common/activity-logger';
import { ServiceUnavailableDomainException } from '../../../shared/common/exceptions/service-unavailable.exception';
import { RabbitmqPublisherService } from '../../../shared/rabbitmq/rabbitmq-publisher.service';
import { RoutingDecisionStatus } from '../entities/routing-decision.entity';
import { RoutingDecisionMadeEvent } from '../interfaces/routing.events';
import { countryFromRecipient } from './country-from-recipient';
import { EligibleProvider, RoutingPolicyService } from './routing-policy.service';
import { RoutingDecisionService } from './routing-decision.service';

export interface RouteCriteria {
  recipient: string;
  type: string;
}

export interface RouteResult {
  provider: string;
}

@Injectable()
export class RoutingService {
  constructor(
    private readonly policy: RoutingPolicyService,
    private readonly decisions: RoutingDecisionService,
    private readonly adaptersClient: AdaptersClient,
    private readonly publisher: RabbitmqPublisherService,
  ) {}

  async route(messageId: string, criteria: RouteCriteria): Promise<RouteResult> {
    const country = countryFromRecipient(criteria.recipient);
    const candidates = await this.policy.eligibleProviders({
      country,
      operator: null,
      type: criteria.type,
    });

    const selected = await this.trySelect(messageId, candidates);

    this.publisher.publish(
      new RoutingDecisionMadeEvent(
        messageId,
        selected?.provider ?? null,
        selected ? RoutingDecisionStatus.SELECTED : RoutingDecisionStatus.REJECTED,
      ),
    );

    if (!selected) {
      throw new ServiceUnavailableDomainException(`No available provider for message ${messageId}.`);
    }

    return { provider: selected.provider };
  }

  private async trySelect(
    messageId: string,
    candidates: EligibleProvider[],
  ): Promise<EligibleProvider | null> {
    let selected: EligibleProvider | null = null;

    for (const candidate of candidates) {
      if (selected) {
        await this.decisions.record({
          messageId,
          provider: candidate.provider,
          status: RoutingDecisionStatus.ELIGIBLE,
          reason: 'not attempted, a higher priority provider was already selected',
          cost: candidate.cost,
          health: null,
        });
        continue;
      }

      const available = await this.isAvailable(candidate.provider);
      if (available) {
        selected = candidate;
        await this.decisions.record({
          messageId,
          provider: candidate.provider,
          status: RoutingDecisionStatus.SELECTED,
          reason: null,
          cost: candidate.cost,
          health: 'healthy',
        });
      } else {
        await this.decisions.record({
          messageId,
          provider: candidate.provider,
          status: RoutingDecisionStatus.REJECTED,
          reason: 'provider unavailable',
          cost: candidate.cost,
          health: 'unhealthy',
        });
      }
    }

    return selected;
  }

  private async isAvailable(provider: string): Promise<boolean> {
    try {
      const health = await this.adaptersClient.getProviderHealth(provider);
      return health.available;
    } catch (error) {
      ActivityLogger.error('routing.health_check_failed', error, { provider });
      return false;
    }
  }
}
