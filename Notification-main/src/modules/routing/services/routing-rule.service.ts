import { randomUUID } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { NotFoundDomainException } from '../../../shared/common/exceptions/not-found.exception';
import { ProviderService } from '../../provider/services/provider.service';
import { RoutingRule, RoutingRuleAction, RoutingRuleStatus } from '../entities/routing-rule.entity';
import {
  ROUTING_RULE_REPOSITORY,
  type RoutingRuleRepository,
} from '../interfaces/routing-rule.repository.interface';

export interface CreateRoutingRuleInput {
  country?: string | null;
  operator?: string | null;
  type?: string | null;
  providerId: string;
  action?: RoutingRuleAction;
  priority?: number;
  cost?: number | null;
}

export interface UpdateRoutingRuleInput {
  country?: string | null;
  operator?: string | null;
  type?: string | null;
  providerId?: string;
  action?: RoutingRuleAction;
  priority?: number;
  cost?: number | null;
  status?: RoutingRuleStatus;
}

@Injectable()
export class RoutingRuleService {
  constructor(
    @Inject(ROUTING_RULE_REPOSITORY) private readonly repository: RoutingRuleRepository,
    private readonly providers: ProviderService,
  ) {}

  async create(input: CreateRoutingRuleInput): Promise<RoutingRule> {
    await this.providers.findById(input.providerId);
    const rule = RoutingRule.create({
      id: randomUUID(),
      country: input.country ?? null,
      operator: input.operator ?? null,
      type: input.type ?? null,
      providerId: input.providerId,
      action: input.action ?? RoutingRuleAction.ALLOW,
      priority: input.priority ?? 0,
      cost: input.cost ?? null,
      createdAt: new Date(),
    });
    return this.repository.create(rule);
  }

  findAll(): Promise<RoutingRule[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<RoutingRule> {
    const rule = await this.repository.findById(id);
    if (!rule) {
      throw new NotFoundDomainException(`Routing rule ${id} not found.`);
    }
    return rule;
  }

  async update(id: string, changes: UpdateRoutingRuleInput): Promise<RoutingRule> {
    const rule = await this.findById(id);
    if (changes.providerId) {
      await this.providers.findById(changes.providerId);
    }
    return this.repository.update(rule.withUpdates(changes));
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }
}
