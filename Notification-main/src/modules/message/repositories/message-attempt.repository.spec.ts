import { AttemptStatus as PrismaAttemptStatus } from '@prisma/client';
import type { PrismaService } from '../../../shared/prisma/prisma.service';
import { AttemptStatus, MessageAttempt } from '../entities/message-attempt.entity';
import { PrismaMessageAttemptRepository } from './message-attempt.repository';

function setup() {
  const prisma = {
    messageAttempt: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };
  const repository = new PrismaMessageAttemptRepository(prisma as unknown as PrismaService);
  return { prisma, repository };
}

const prismaRow = {
  id: 'a1',
  messageId: 'm1',
  provider: 'provider-a',
  attemptNumber: 1,
  status: PrismaAttemptStatus.PENDING,
  errorCode: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  completedAt: null,
};

describe('PrismaMessageAttemptRepository', () => {
  it('create maps the domain status to the Prisma enum', async () => {
    const { prisma, repository } = setup();
    prisma.messageAttempt.create.mockResolvedValue(prismaRow as never);
    const attempt = MessageAttempt.create({
      id: 'a1',
      messageId: 'm1',
      provider: 'provider-a',
      attemptNumber: 1,
      createdAt: prismaRow.createdAt,
    });

    const result = await repository.create(attempt);

    expect(prisma.messageAttempt.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ id: 'a1', status: PrismaAttemptStatus.PENDING }),
    });
    expect(result).toBeInstanceOf(MessageAttempt);
    expect(result.status).toBe(AttemptStatus.PENDING);
  });

  it('findByMessageId orders by attempt number ascending and maps every row', async () => {
    const { prisma, repository } = setup();
    prisma.messageAttempt.findMany.mockResolvedValue([prismaRow] as never);

    const result = await repository.findByMessageId('m1');

    expect(prisma.messageAttempt.findMany).toHaveBeenCalledWith({
      where: { messageId: 'm1' },
      orderBy: { attemptNumber: 'asc' },
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(MessageAttempt);
  });

  it('updateOutcome maps the outcome status to the Prisma enum and stamps completedAt', async () => {
    const { prisma, repository } = setup();
    prisma.messageAttempt.update.mockResolvedValue({
      ...prismaRow,
      status: PrismaAttemptStatus.FAILED,
      errorCode: 'PROVIDER_TIMEOUT',
      completedAt: new Date('2026-01-01T00:05:00.000Z'),
    } as never);

    const result = await repository.updateOutcome('a1', AttemptStatus.FAILED, 'PROVIDER_TIMEOUT');

    expect(prisma.messageAttempt.update).toHaveBeenCalledWith({
      where: { id: 'a1' },
      data: expect.objectContaining({
        status: PrismaAttemptStatus.FAILED,
        errorCode: 'PROVIDER_TIMEOUT',
      }),
    });
    expect(result.status).toBe(AttemptStatus.FAILED);
    expect(result.errorCode).toBe('PROVIDER_TIMEOUT');
    expect(result.completedAt).not.toBeNull();
  });
});
