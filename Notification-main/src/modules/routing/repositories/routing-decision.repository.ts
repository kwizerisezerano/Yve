import { Injectable } from '@nestjs/common';
import {
  RoutingDecisionStatus as PrismaRoutingDecisionStatus,
  type RoutingDecision as PrismaRoutingDecision,
} from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { RoutingDecision, RoutingDecisionStatus } from '../entities/routing-decision.entity';
import { RoutingDecisionRepository } from '../interfaces/routing-decision.repository.interface';

const TO_PRISMA_STATUS: Record<RoutingDecisionStatus, PrismaRoutingDecisionStatus> = {
  [RoutingDecisionStatus.SELECTED]: PrismaRoutingDecisionStatus.SELECTED,
  [RoutingDecisionStatus.ELIGIBLE]: PrismaRoutingDecisionStatus.ELIGIBLE,
  [RoutingDecisionStatus.REJECTED]: PrismaRoutingDecisionStatus.REJECTED,
};

const FROM_PRISMA_STATUS: Record<PrismaRoutingDecisionStatus, RoutingDecisionStatus> = {
  [PrismaRoutingDecisionStatus.SELECTED]: RoutingDecisionStatus.SELECTED,
  [PrismaRoutingDecisionStatus.ELIGIBLE]: RoutingDecisionStatus.ELIGIBLE,
  [PrismaRoutingDecisionStatus.REJECTED]: RoutingDecisionStatus.REJECTED,
};

@Injectable()
export class PrismaRoutingDecisionRepository implements RoutingDecisionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(decision: RoutingDecision): Promise<RoutingDecision> {
    const created = await this.prisma.routingDecision.create({
      data: {
        id: decision.id,
        messageId: decision.messageId,
        provider: decision.provider,
        status: TO_PRISMA_STATUS[decision.status],
        reason: decision.reason,
        cost: decision.cost,
        health: decision.health,
        createdAt: decision.createdAt,
      },
    });
    return toDomain(created);
  }

  async findByMessageId(messageId: string): Promise<RoutingDecision[]> {
    const found = await this.prisma.routingDecision.findMany({
      where: { messageId },
      orderBy: { createdAt: 'asc' },
    });
    return found.map(toDomain);
  }
}

function toDomain(record: PrismaRoutingDecision): RoutingDecision {
  return new RoutingDecision({
    id: record.id,
    messageId: record.messageId,
    provider: record.provider,
    status: FROM_PRISMA_STATUS[record.status],
    reason: record.reason,
    cost: record.cost,
    health: record.health,
    createdAt: record.createdAt,
  });
}
