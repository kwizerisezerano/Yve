import { Prisma, TenantStatus as PrismaTenantStatus } from '@prisma/client';
import type { PrismaService } from '../../../shared/prisma/prisma.service';
import { ConflictDomainException } from '../../../shared/common/exceptions/conflict.exception';
import { NotFoundDomainException } from '../../../shared/common/exceptions/not-found.exception';
import { Tenant, TenantStatus } from '../entities/tenant.entity';
import { PrismaTenantRepository } from './tenant.repository';

function setup() {
  const prisma = {
    tenant: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  const repository = new PrismaTenantRepository(prisma as unknown as PrismaService);
  return { prisma, repository };
}

function knownRequestError(code: string): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('boom', { code, clientVersion: '5.22.0' });
}

function unknownForeignKeyError(): Prisma.PrismaClientUnknownRequestError {
  return new Prisma.PrismaClientUnknownRequestError(
    'update or delete on table "tenants" violates RESTRICT setting of foreign key constraint',
    { clientVersion: '5.22.0' },
  );
}

const prismaRow = {
  id: 't1',
  name: 'Acme',
  phone: '+15551234567',
  apiKeyHash: 'hash-1',
  defaultSender: 'ACME',
  webhookUrl: null,
  status: PrismaTenantStatus.ACTIVE,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('PrismaTenantRepository', () => {
  it('create maps the domain status to the Prisma enum', async () => {
    const { prisma, repository } = setup();
    prisma.tenant.create.mockResolvedValue(prismaRow);
    const tenant = Tenant.create({
      id: 't1',
      name: 'Acme',
      phone: '+15551234567',
      apiKeyHash: 'hash-1',
      defaultSender: 'ACME',
      createdAt: prismaRow.createdAt,
    });

    const result = await repository.create(tenant);

    expect(prisma.tenant.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ id: 't1', status: PrismaTenantStatus.ACTIVE }),
    });
    expect(result).toBeInstanceOf(Tenant);
  });

  it('findById returns null when no tenant matches', async () => {
    const { prisma, repository } = setup();
    prisma.tenant.findUnique.mockResolvedValue(null);

    const result = await repository.findById('missing');

    expect(prisma.tenant.findUnique).toHaveBeenCalledWith({ where: { id: 'missing' } });
    expect(result).toBeNull();
  });

  it('findById maps the found row to a domain Tenant', async () => {
    const { prisma, repository } = setup();
    prisma.tenant.findUnique.mockResolvedValue(prismaRow);

    const result = await repository.findById('t1');

    expect(result).toBeInstanceOf(Tenant);
    expect(result?.id).toBe('t1');
    expect(result?.phone).toBe('+15551234567');
    expect(result?.status).toBe(TenantStatus.ACTIVE);
  });

  it('findByApiKeyHash returns null when no tenant matches', async () => {
    const { prisma, repository } = setup();
    prisma.tenant.findUnique.mockResolvedValue(null);

    const result = await repository.findByApiKeyHash('missing-hash');

    expect(prisma.tenant.findUnique).toHaveBeenCalledWith({ where: { apiKeyHash: 'missing-hash' } });
    expect(result).toBeNull();
  });

  it('findByApiKeyHash maps the found row to a domain Tenant', async () => {
    const { prisma, repository } = setup();
    prisma.tenant.findUnique.mockResolvedValue(prismaRow);

    const result = await repository.findByApiKeyHash('hash-1');

    expect(result).toBeInstanceOf(Tenant);
    expect(result?.id).toBe('t1');
  });

  it('findAll orders by createdAt descending and maps every row', async () => {
    const { prisma, repository } = setup();
    prisma.tenant.findMany.mockResolvedValue([prismaRow]);

    const result = await repository.findAll();

    expect(prisma.tenant.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } });
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Tenant);
  });

  it('update persists the tenant and maps the result back', async () => {
    const { prisma, repository } = setup();
    prisma.tenant.update.mockResolvedValue({ ...prismaRow, name: 'New Name' });
    const tenant = new Tenant({
      id: 't1',
      name: 'New Name',
      phone: '+15551234567',
      apiKeyHash: 'hash-1',
      defaultSender: 'ACME',
      webhookUrl: null,
      status: TenantStatus.ACTIVE,
      createdAt: prismaRow.createdAt,
      updatedAt: new Date(),
    });

    const result = await repository.update(tenant);

    expect(prisma.tenant.update).toHaveBeenCalledWith({
      where: { id: 't1' },
      data: expect.objectContaining({ name: 'New Name' }),
    });
    expect(result.name).toBe('New Name');
  });

  it('update throws NotFoundDomainException when the record does not exist', async () => {
    const { prisma, repository } = setup();
    prisma.tenant.update.mockRejectedValue(knownRequestError('P2025'));
    const tenant = Tenant.create({
      id: 'missing',
      name: 'Acme',
      phone: '+15551234567',
      apiKeyHash: 'hash-1',
      defaultSender: 'ACME',
      createdAt: new Date(),
    });

    await expect(repository.update(tenant)).rejects.toBeInstanceOf(NotFoundDomainException);
  });

  it('delete removes the tenant', async () => {
    const { prisma, repository } = setup();
    prisma.tenant.delete.mockResolvedValue(prismaRow);

    await repository.delete('t1');

    expect(prisma.tenant.delete).toHaveBeenCalledWith({ where: { id: 't1' } });
  });

  it('delete throws NotFoundDomainException when the record does not exist', async () => {
    const { prisma, repository } = setup();
    prisma.tenant.delete.mockRejectedValue(knownRequestError('P2025'));

    await expect(repository.delete('missing')).rejects.toBeInstanceOf(NotFoundDomainException);
  });

  it('delete throws ConflictDomainException when the tenant still has messages (known P2003)', async () => {
    const { prisma, repository } = setup();
    prisma.tenant.delete.mockRejectedValue(knownRequestError('P2003'));

    await expect(repository.delete('t1')).rejects.toBeInstanceOf(ConflictDomainException);
  });

  it('delete throws ConflictDomainException for the RESTRICT violation Postgres reports as an unknown Prisma error', async () => {
    const { prisma, repository } = setup();
    prisma.tenant.delete.mockRejectedValue(unknownForeignKeyError());

    await expect(repository.delete('t1')).rejects.toBeInstanceOf(ConflictDomainException);
  });

  it('rethrows an unrelated unknown error from delete', async () => {
    const { prisma, repository } = setup();
    const error = new Prisma.PrismaClientUnknownRequestError('some other database error', {
      clientVersion: '5.22.0',
    });
    prisma.tenant.delete.mockRejectedValue(error);

    await expect(repository.delete('t1')).rejects.toBe(error);
  });
});
