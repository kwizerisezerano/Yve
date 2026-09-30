import { RoutingDecisionStatus as PrismaRoutingDecisionStatus } from '@prisma/client';
import type { PrismaService } from '../../../shared/prisma/prisma.service';
import { RoutingDecision, RoutingDecisionStatus } from '../entities/routing-decision.entity';
import { PrismaRoutingDecisionRepository } from './routing-decision.repository';

function setup() {
  const prisma = {
    routingDecision: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };
  const repository = new PrismaRoutingDecisionRepository(prisma as unknown as PrismaService);
  return { prisma, repository };
}

const prismaRow = {
  id: 'd1',
  messageId: 'm1',
  provider: 'provider-a',
  status: PrismaRoutingDecisionStatus.SELECTED,
  reason: null,
  cost: 0.02,
  health: 'healthy',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('PrismaRoutingDecisionRepository', () => {
  it('create maps the domain status to the Prisma enum', async () => {
    const { prisma, repository } = setup();
    prisma.routingDecision.create.mockResolvedValue(prismaRow);
    const decision = RoutingDecision.create({
      id: 'd1',
      messageId: 'm1',
      provider: 'provider-a',
      status: RoutingDecisionStatus.SELECTED,
      reason: null,
      cost: 0.02,
      health: 'healthy',
      createdAt: prismaRow.createdAt,
    });

    const result = await repository.create(decision);

    expect(prisma.routingDecision.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ id: 'd1', status: PrismaRoutingDecisionStatus.SELECTED }),
    });
    expect(result).toBeInstanceOf(RoutingDecision);
  });

  it('findByMessageId orders by createdAt ascending and maps every row', async () => {
    const { prisma, repository } = setup();
    prisma.routingDecision.findMany.mockResolvedValue([prismaRow]);

    const result = await repository.findByMessageId('m1');

    expect(prisma.routingDecision.findMany).toHaveBeenCalledWith({
      where: { messageId: 'm1' },
      orderBy: { createdAt: 'asc' },
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(RoutingDecision);
  });
});
