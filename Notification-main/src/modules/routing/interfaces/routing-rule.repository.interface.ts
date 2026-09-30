import { RoutingRule } from '../entities/routing-rule.entity';

export const ROUTING_RULE_REPOSITORY = Symbol('ROUTING_RULE_REPOSITORY');

export interface RoutingRuleRepository {
  create(rule: RoutingRule): Promise<RoutingRule>;
  findById(id: string): Promise<RoutingRule | null>;
  findAll(): Promise<RoutingRule[]>;
  findActive(): Promise<RoutingRule[]>;
  update(rule: RoutingRule): Promise<RoutingRule>;
  delete(id: string): Promise<void>;
}
