import { Injectable } from '@nestjs/common';
import {
  RoutingRuleAction as PrismaRoutingRuleAction,
  RoutingRuleStatus as PrismaRoutingRuleStatus,
  type RoutingRule as PrismaRoutingRule,
} from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { NotFoundDomainException } from '../../../shared/common/exceptions/not-found.exception';
import { isKnownPrismaError, PRISMA_RECORD_NOT_FOUND } from '../../../shared/common/prisma-errors';
import { RoutingRule, RoutingRuleAction, RoutingRuleStatus } from '../entities/routing-rule.entity';
import { RoutingRuleRepository } from '../interfaces/routing-rule.repository.interface';

const TO_PRISMA_ACTION: Record<RoutingRuleAction, PrismaRoutingRuleAction> = {
  [RoutingRuleAction.ALLOW]: PrismaRoutingRuleAction.ALLOW,
  [RoutingRuleAction.BLOCK]: PrismaRoutingRuleAction.BLOCK,
};

const FROM_PRISMA_ACTION: Record<PrismaRoutingRuleAction, RoutingRuleAction> = {
  [PrismaRoutingRuleAction.ALLOW]: RoutingRuleAction.ALLOW,
  [PrismaRoutingRuleAction.BLOCK]: RoutingRuleAction.BLOCK,
};

const TO_PRISMA_STATUS: Record<RoutingRuleStatus, PrismaRoutingRuleStatus> = {
  [RoutingRuleStatus.ACTIVE]: PrismaRoutingRuleStatus.ACTIVE,
  [RoutingRuleStatus.DISABLED]: PrismaRoutingRuleStatus.DISABLED,
};

const FROM_PRISMA_STATUS: Record<PrismaRoutingRuleStatus, RoutingRuleStatus> = {
  [PrismaRoutingRuleStatus.ACTIVE]: RoutingRuleStatus.ACTIVE,
  [PrismaRoutingRuleStatus.DISABLED]: RoutingRuleStatus.DISABLED,
};

@Injectable()
export class PrismaRoutingRuleRepository implements RoutingRuleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(rule: RoutingRule): Promise<RoutingRule> {
    const created = await this.prisma.routingRule.create({ data: toPersistence(rule) });
    return toDomain(created);
  }

  async findById(id: string): Promise<RoutingRule | null> {
    const found = await this.prisma.routingRule.findUnique({ where: { id } });
    return found ? toDomain(found) : null;
  }

  async findAll(): Promise<RoutingRule[]> {
    const found = await this.prisma.routingRule.findMany({ orderBy: { createdAt: 'desc' } });
    return found.map(toDomain);
  }

  async findActive(): Promise<RoutingRule[]> {
    const found = await this.prisma.routingRule.findMany({
      where: { status: PrismaRoutingRuleStatus.ACTIVE },
    });
    return found.map(toDomain);
  }

  async update(rule: RoutingRule): Promise<RoutingRule> {
    try {
      const updated = await this.prisma.routingRule.update({
        where: { id: rule.id },
        data: toPersistence(rule),
      });
      return toDomain(updated);
    } catch (error) {
      if (isKnownPrismaError(error, PRISMA_RECORD_NOT_FOUND)) {
        throw new NotFoundDomainException(`Routing rule ${rule.id} not found.`);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.routingRule.delete({ where: { id } });
    } catch (error) {
      if (isKnownPrismaError(error, PRISMA_RECORD_NOT_FOUND)) {
        throw new NotFoundDomainException(`Routing rule ${id} not found.`);
      }
      throw error;
    }
  }
}

function toPersistence(rule: RoutingRule) {
  return {
    id: rule.id,
    country: rule.country,
    operator: rule.operator,
    type: rule.type,
    providerId: rule.providerId,
    action: TO_PRISMA_ACTION[rule.action],
    priority: rule.priority,
    cost: rule.cost,
    status: TO_PRISMA_STATUS[rule.status],
    createdAt: rule.createdAt,
    updatedAt: rule.updatedAt,
  };
}

function toDomain(record: PrismaRoutingRule): RoutingRule {
  return new RoutingRule({
    id: record.id,
    country: record.country,
    operator: record.operator,
    type: record.type,
    providerId: record.providerId,
    action: FROM_PRISMA_ACTION[record.action],
    priority: record.priority,
    cost: record.cost,
    status: FROM_PRISMA_STATUS[record.status],
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}
