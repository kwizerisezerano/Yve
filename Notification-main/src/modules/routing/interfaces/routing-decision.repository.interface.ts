import { RoutingDecision } from '../entities/routing-decision.entity';

export const ROUTING_DECISION_REPOSITORY = Symbol('ROUTING_DECISION_REPOSITORY');

export interface RoutingDecisionRepository {
  create(decision: RoutingDecision): Promise<RoutingDecision>;
  findByMessageId(messageId: string): Promise<RoutingDecision[]>;
}
