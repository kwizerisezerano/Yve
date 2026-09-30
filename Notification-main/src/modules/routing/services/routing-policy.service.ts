import { Inject, Injectable } from '@nestjs/common';
import { Provider } from '../../provider/entities/provider.entity';
import { ProviderService } from '../../provider/services/provider.service';
import { RoutingCriteria, RoutingRuleAction } from '../entities/routing-rule.entity';
import {
  ROUTING_RULE_REPOSITORY,
  type RoutingRuleRepository,
} from '../interfaces/routing-rule.repository.interface';

export interface EligibleProvider {
  provider: string;
  priority: number;
  cost: number | null;
}

@Injectable()
export class RoutingPolicyService {
  constructor(
    @Inject(ROUTING_RULE_REPOSITORY) private readonly rules: RoutingRuleRepository,
    private readonly providers: ProviderService,
  ) {}

  async eligibleProviders(criteria: RoutingCriteria): Promise<EligibleProvider[]> {
    const activeRules = await this.rules.findActive();
    const matching = activeRules.filter((rule) => rule.matches(criteria));

    const providerIds = [...new Set(matching.map((rule) => rule.providerId))];
    const providersById = new Map<string, Provider>(
      (await this.providers.findByIds(providerIds)).map((provider) => [provider.id, provider]),
    );

    const activeMatching = matching.filter((rule) => providersById.get(rule.providerId)?.isActive());

    const blockedProviderIds = new Set(
      activeMatching
        .filter((rule) => rule.action === RoutingRuleAction.BLOCK)
        .map((rule) => rule.providerId),
    );

    const bestAllowRuleByProviderId = new Map<string, EligibleProvider>();
    for (const rule of activeMatching) {
      if (rule.action !== RoutingRuleAction.ALLOW || blockedProviderIds.has(rule.providerId)) {
        continue;
      }
      const provider = providersById.get(rule.providerId);
      if (!provider) {
        continue;
      }
      const existing = bestAllowRuleByProviderId.get(rule.providerId);
      if (!existing || rule.priority > existing.priority) {
        bestAllowRuleByProviderId.set(rule.providerId, {
          provider: provider.name,
          priority: rule.priority,
          cost: rule.cost ?? provider.defaultCost,
        });
      }
    }

    return [...bestAllowRuleByProviderId.values()].sort((a, b) => b.priority - a.priority);
  }
}
