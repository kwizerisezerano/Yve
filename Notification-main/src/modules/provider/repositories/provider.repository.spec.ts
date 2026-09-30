import { Prisma, ProviderStatus as PrismaProviderStatus } from '@prisma/client';
import type { PrismaService } from '../../../shared/prisma/prisma.service';
import { ConflictDomainException } from '../../../shared/common/exceptions/conflict.exception';
import { NotFoundDomainException } from '../../../shared/common/exceptions/not-found.exception';
import { Provider, ProviderStatus } from '../entities/provider.entity';
import { PrismaProviderRepository } from './provider.repository';

function setup() {
  const prisma = {
    provider: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  const repository = new PrismaProviderRepository(prisma as unknown as PrismaService);
  return { prisma, repository };
}

function knownRequestError(code: string): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('boom', { code, clientVersion: '5.22.0' });
}

function unknownForeignKeyError(): Prisma.PrismaClientUnknownRequestError {
  return new Prisma.PrismaClientUnknownRequestError(
    'update or delete on table "providers" violates RESTRICT setting of foreign key constraint',
    { clientVersion: '5.22.0' },
  );
}

const prismaRow = {
  id: 'p1',
  name: 'mtn',
  description: 'MTN Rwanda',
  defaultCost: 0.02,
  status: PrismaProviderStatus.ACTIVE,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

function domainProvider(): Provider {
  return new Provider({
    id: 'p1',
    name: 'mtn',
    description: 'MTN Rwanda',
    defaultCost: 0.02,
    status: ProviderStatus.ACTIVE,
    createdAt: prismaRow.createdAt,
    updatedAt: prismaRow.updatedAt,
  });
}

describe('PrismaProviderRepository', () => {
  it('create maps the domain status to the Prisma enum', async () => {
    const { prisma, repository } = setup();
    prisma.provider.create.mockResolvedValue(prismaRow);

    const result = await repository.create(domainProvider());

    expect(prisma.provider.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ id: 'p1', status: PrismaProviderStatus.ACTIVE }),
    });
    expect(result).toBeInstanceOf(Provider);
  });

  it('create throws ConflictDomainException when the name is already taken', async () => {
    const { prisma, repository } = setup();
    prisma.provider.create.mockRejectedValue(knownRequestError('P2002'));

    await expect(repository.create(domainProvider())).rejects.toBeInstanceOf(ConflictDomainException);
  });

  it('findById returns null when no provider matches', async () => {
    const { prisma, repository } = setup();
    prisma.provider.findUnique.mockResolvedValue(null);

    const result = await repository.findById('missing');

    expect(prisma.provider.findUnique).toHaveBeenCalledWith({ where: { id: 'missing' } });
    expect(result).toBeNull();
  });

  it('findByIds returns an empty array without querying when given no ids', async () => {
    const { prisma, repository } = setup();

    const result = await repository.findByIds([]);

    expect(prisma.provider.findMany).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('findByIds queries by the given ids and maps every row', async () => {
    const { prisma, repository } = setup();
    prisma.provider.findMany.mockResolvedValue([prismaRow]);

    const result = await repository.findByIds(['p1']);

    expect(prisma.provider.findMany).toHaveBeenCalledWith({ where: { id: { in: ['p1'] } } });
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Provider);
  });

  it('findAll orders by createdAt descending and maps every row', async () => {
    const { prisma, repository } = setup();
    prisma.provider.findMany.mockResolvedValue([prismaRow]);

    const result = await repository.findAll();

    expect(prisma.provider.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } });
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Provider);
  });

  it('update persists the provider and maps the result back', async () => {
    const { prisma, repository } = setup();
    prisma.provider.update.mockResolvedValue({ ...prismaRow, defaultCost: 0.05 });

    const result = await repository.update(domainProvider().withUpdates({ defaultCost: 0.05 }));

    expect(prisma.provider.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: expect.objectContaining({ defaultCost: 0.05 }),
    });
    expect(result.defaultCost).toBe(0.05);
  });

  it('update throws NotFoundDomainException when the record does not exist', async () => {
    const { prisma, repository } = setup();
    prisma.provider.update.mockRejectedValue(knownRequestError('P2025'));

    await expect(repository.update(domainProvider())).rejects.toBeInstanceOf(NotFoundDomainException);
  });

  it('update throws ConflictDomainException when the name is already taken', async () => {
    const { prisma, repository } = setup();
    prisma.provider.update.mockRejectedValue(knownRequestError('P2002'));

    await expect(repository.update(domainProvider())).rejects.toBeInstanceOf(ConflictDomainException);
  });

  it('delete removes the provider', async () => {
    const { prisma, repository } = setup();
    prisma.provider.delete.mockResolvedValue(prismaRow);

    await repository.delete('p1');

    expect(prisma.provider.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
  });

  it('delete throws NotFoundDomainException when the record does not exist', async () => {
    const { prisma, repository } = setup();
    prisma.provider.delete.mockRejectedValue(knownRequestError('P2025'));

    await expect(repository.delete('missing')).rejects.toBeInstanceOf(NotFoundDomainException);
  });

  it('delete throws ConflictDomainException when a routing rule still references it (known P2003)', async () => {
    const { prisma, repository } = setup();
    prisma.provider.delete.mockRejectedValue(knownRequestError('P2003'));

    await expect(repository.delete('p1')).rejects.toBeInstanceOf(ConflictDomainException);
  });

  it('delete throws ConflictDomainException for the RESTRICT violation Postgres reports as an unknown Prisma error', async () => {
    const { prisma, repository } = setup();
    prisma.provider.delete.mockRejectedValue(unknownForeignKeyError());

    await expect(repository.delete('p1')).rejects.toBeInstanceOf(ConflictDomainException);
  });

  it('rethrows an unrelated unknown error from delete', async () => {
    const { prisma, repository } = setup();
    const error = new Prisma.PrismaClientUnknownRequestError('some other database error', {
      clientVersion: '5.22.0',
    });
    prisma.provider.delete.mockRejectedValue(error);

    await expect(repository.delete('p1')).rejects.toBe(error);
  });
});
