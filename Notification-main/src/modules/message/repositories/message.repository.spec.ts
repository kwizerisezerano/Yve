import { MessageStatus as PrismaMessageStatus } from '@prisma/client';
import type { PrismaService } from '../../../shared/prisma/prisma.service';
import { Message, MessageStatus } from '../entities/message.entity';
import { PrismaMessageRepository } from './message.repository';

function setup() {
  const prisma = {
    message: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };
  const repository = new PrismaMessageRepository(prisma as unknown as PrismaService);
  return { prisma, repository };
}

const prismaRow = {
  id: 'm1',
  tenantId: 't1',
  sender: 'sender-1',
  recipient: '+15551234567',
  body: 'hello',
  type: 'sms',
  status: PrismaMessageStatus.QUEUED,
  provider: null,
  idempotencyKey: 'idem-1',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('PrismaMessageRepository', () => {
  it('create maps the domain status to the Prisma enum and maps the row back to a domain Message', async () => {
    const { prisma, repository } = setup();
    prisma.message.create.mockResolvedValue(prismaRow as never);
    const message = Message.create({
      id: 'm1',
      tenantId: 't1',
      sender: 'sender-1',
      recipient: '+15551234567',
      body: 'hello',
      type: 'sms',
      idempotencyKey: 'idem-1',
      createdAt: prismaRow.createdAt,
      updatedAt: prismaRow.updatedAt,
    });

    const result = await repository.create(message);

    expect(prisma.message.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ id: 'm1', status: PrismaMessageStatus.QUEUED }),
    });
    expect(result).toBeInstanceOf(Message);
    expect(result.status).toBe(MessageStatus.QUEUED);
  });

  it('findById returns null when the row does not exist', async () => {
    const { prisma, repository } = setup();
    prisma.message.findUnique.mockResolvedValue(null);

    const result = await repository.findById('missing');

    expect(result).toBeNull();
  });

  it('findById maps the found row to a domain Message', async () => {
    const { prisma, repository } = setup();
    prisma.message.findUnique.mockResolvedValue(prismaRow as never);

    const result = await repository.findById('m1');

    expect(result?.id).toBe('m1');
    expect(result?.status).toBe(MessageStatus.QUEUED);
  });

  it('findByTenantId orders by createdAt descending and maps every row', async () => {
    const { prisma, repository } = setup();
    prisma.message.findMany.mockResolvedValue([prismaRow] as never);

    const result = await repository.findByTenantId('t1');

    expect(prisma.message.findMany).toHaveBeenCalledWith({
      where: { tenantId: 't1' },
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Message);
  });

  it('updateStatus maps the domain status to the Prisma enum, keyed by id, and includes the provider when given', async () => {
    const { prisma, repository } = setup();
    prisma.message.update.mockResolvedValue({
      ...prismaRow,
      status: PrismaMessageStatus.ROUTED,
      provider: 'provider-a',
    } as never);

    const result = await repository.updateStatus('m1', MessageStatus.ROUTED, 'provider-a');

    expect(prisma.message.update).toHaveBeenCalledWith({
      where: { id: 'm1' },
      data: { status: PrismaMessageStatus.ROUTED, provider: 'provider-a' },
    });
    expect(result.status).toBe(MessageStatus.ROUTED);
    expect(result.provider).toBe('provider-a');
  });

  it('updateStatus omits the provider field entirely when not given, leaving it unchanged', async () => {
    const { prisma, repository } = setup();
    prisma.message.update.mockResolvedValue(prismaRow as never);

    await repository.updateStatus('m1', MessageStatus.QUEUED);

    expect(prisma.message.update).toHaveBeenCalledWith({
      where: { id: 'm1' },
      data: { status: PrismaMessageStatus.QUEUED },
    });
  });
});
