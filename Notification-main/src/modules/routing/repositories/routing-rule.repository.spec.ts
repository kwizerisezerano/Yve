import {
  RoutingRuleAction as PrismaRoutingRuleAction,
  RoutingRuleStatus as PrismaRoutingRuleStatus,
} from '@prisma/client';
import type { PrismaService } from '../../../shared/prisma/prisma.service';
import { NotFoundDomainException } from '../../../shared/common/exceptions/not-found.exception';
import { RoutingRule, RoutingRuleAction, RoutingRuleStatus } from '../entities/routing-rule.entity';
import { PrismaRoutingRuleRepository } from './routing-rule.repository';

function setup() {
  const prisma = {
    routingRule: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  const repository = new PrismaRoutingRuleRepository(prisma as unknown as PrismaService);
  return { prisma, repository };
}

const prismaRow = {
  id: 'r1',
  country: 'RW',
  operator: null,
  type: 'sms',
  providerId: 'p1',
  action: PrismaRoutingRuleAction.ALLOW,
  priority: 10,
  cost: 0.02,
  status: PrismaRoutingRuleStatus.ACTIVE,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

function domainRule(): RoutingRule {
  return new RoutingRule({
    id: 'r1',
    country: 'RW',
    operator: null,
    type: 'sms',
    providerId: 'p1',
    action: RoutingRuleAction.ALLOW,
    priority: 10,
    cost: 0.02,
    status: RoutingRuleStatus.ACTIVE,
    createdAt: prismaRow.createdAt,
    updatedAt: prismaRow.updatedAt,
  });
}

describe('PrismaRoutingRuleRepository', () => {
  it('create maps the domain action and status to the Prisma enums', async () => {
    const { prisma, repository } = setup();
    prisma.routingRule.create.mockResolvedValue(prismaRow);

    const result = await repository.create(domainRule());

    expect(prisma.routingRule.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: 'r1',
        action: PrismaRoutingRuleAction.ALLOW,
        status: PrismaRoutingRuleStatus.ACTIVE,
      }),
    });
    expect(result).toBeInstanceOf(RoutingRule);
  });

  it('findById returns null when no rule matches', async () => {
    const { prisma, repository } = setup();
    prisma.routingRule.findUnique.mockResolvedValue(null);

    const result = await repository.findById('missing');

    expect(prisma.routingRule.findUnique).toHaveBeenCalledWith({ where: { id: 'missing' } });
    expect(result).toBeNull();
  });

  it('findAll orders by createdAt descending and maps every row', async () => {
    const { prisma, repository } = setup();
    prisma.routingRule.findMany.mockResolvedValue([prismaRow]);

    const result = await repository.findAll();

    expect(prisma.routingRule.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } });
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(RoutingRule);
  });

  it('findActive filters by the active status and maps every row', async () => {
    const { prisma, repository } = setup();
    prisma.routingRule.findMany.mockResolvedValue([prismaRow]);

    const result = await repository.findActive();

    expect(prisma.routingRule.findMany).toHaveBeenCalledWith({
      where: { status: PrismaRoutingRuleStatus.ACTIVE },
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(RoutingRule);
    expect(result[0].action).toBe(RoutingRuleAction.ALLOW);
  });

  it('update persists the rule and maps the result back', async () => {
    const { prisma, repository } = setup();
    prisma.routingRule.update.mockResolvedValue({ ...prismaRow, priority: 99 });

    const result = await repository.update(domainRule().withUpdates({ priority: 99 }));

    expect(prisma.routingRule.update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: expect.objectContaining({ priority: 99 }),
    });
    expect(result.priority).toBe(99);
  });

  it('update throws NotFoundDomainException when the record does not exist', async () => {
    const { prisma, repository } = setup();
    const { Prisma } = jest.requireActual('@prisma/client');
    prisma.routingRule.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('boom', { code: 'P2025', clientVersion: '5.22.0' }),
    );

    await expect(repository.update(domainRule())).rejects.toBeInstanceOf(NotFoundDomainException);
  });

  it('delete removes the rule', async () => {
    const { prisma, repository } = setup();
    prisma.routingRule.delete.mockResolvedValue(prismaRow);

    await repository.delete('r1');

    expect(prisma.routingRule.delete).toHaveBeenCalledWith({ where: { id: 'r1' } });
  });

  it('delete throws NotFoundDomainException when the record does not exist', async () => {
    const { prisma, repository } = setup();
    const { Prisma } = jest.requireActual('@prisma/client');
    prisma.routingRule.delete.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('boom', { code: 'P2025', clientVersion: '5.22.0' }),
    );

    await expect(repository.delete('missing')).rejects.toBeInstanceOf(NotFoundDomainException);
  });
});
