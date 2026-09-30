import { randomUUID } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { RoutingDecision, RoutingDecisionStatus } from '../entities/routing-decision.entity';
import {
  ROUTING_DECISION_REPOSITORY,
  type RoutingDecisionRepository,
} from '../interfaces/routing-decision.repository.interface';

export interface RecordDecisionInput {
  messageId: string;
  provider: string;
  status: RoutingDecisionStatus;
  reason: string | null;
  cost: number | null;
  health: string | null;
}

@Injectable()
export class RoutingDecisionService {
  constructor(
    @Inject(ROUTING_DECISION_REPOSITORY) private readonly repository: RoutingDecisionRepository,
  ) {}

  record(input: RecordDecisionInput): Promise<RoutingDecision> {
    const decision = RoutingDecision.create({
      id: randomUUID(),
      ...input,
      createdAt: new Date(),
    });
    return this.repository.create(decision);
  }

  findByMessageId(messageId: string): Promise<RoutingDecision[]> {
    return this.repository.findByMessageId(messageId);
  }
}
