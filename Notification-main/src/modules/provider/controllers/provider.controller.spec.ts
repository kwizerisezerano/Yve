import { HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { CreateProviderDto } from '../dtos/create-provider.dto';
import { UpdateProviderDto } from '../dtos/update-provider.dto';
import { Provider, ProviderStatus } from '../entities/provider.entity';
import type { ProviderService } from '../services/provider.service';
import { ProviderController } from './provider.controller';

function createResponse(): { res: Response; statusFn: jest.Mock; jsonFn: jest.Mock } {
  const jsonFn = jest.fn();
  const statusFn = jest.fn().mockReturnValue({ json: jsonFn });
  const res = { status: statusFn } as unknown as Response;
  return { res, statusFn, jsonFn };
}

function createProvider(overrides: Partial<{ id: string; name: string }> = {}): Provider {
  return new Provider({
    id: overrides.id ?? 'p1',
    name: overrides.name ?? 'mtn',
    description: 'MTN Rwanda',
    defaultCost: 0.02,
    status: ProviderStatus.ACTIVE,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });
}

function setup() {
  const providers = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByIds: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<ProviderService>;
  const controller = new ProviderController(providers);
  return { providers, controller };
}

describe('ProviderController', () => {
  it('create calls the service and shapes a 201 response', async () => {
    const { providers, controller } = setup();
    providers.create.mockResolvedValue(createProvider());
    const { res, statusFn, jsonFn } = createResponse();
    const dto: CreateProviderDto = { name: 'mtn' };

    await controller.create(dto, res);

    expect(providers.create).toHaveBeenCalledWith(dto);
    expect(statusFn).toHaveBeenCalledWith(HttpStatus.CREATED);
    expect(jsonFn.mock.calls[0][0].data).toMatchObject({ id: 'p1', name: 'mtn' });
  });

  it('findAll lists providers', async () => {
    const { providers, controller } = setup();
    providers.findAll.mockResolvedValue([createProvider({ id: 'p1' }), createProvider({ id: 'p2' })]);
    const { res, statusFn, jsonFn } = createResponse();

    await controller.findAll(res);

    expect(statusFn).toHaveBeenCalledWith(HttpStatus.OK);
    expect(jsonFn.mock.calls[0][0].data).toHaveLength(2);
  });

  it('findOne returns a single provider summary', async () => {
    const { providers, controller } = setup();
    providers.findById.mockResolvedValue(createProvider());
    const { res, statusFn, jsonFn } = createResponse();

    await controller.findOne('p1', res);

    expect(providers.findById).toHaveBeenCalledWith('p1');
    expect(statusFn).toHaveBeenCalledWith(HttpStatus.OK);
    expect(jsonFn.mock.calls[0][0].data).toMatchObject({ id: 'p1', name: 'mtn' });
  });

  it('update forwards the changes and returns the updated summary', async () => {
    const { providers, controller } = setup();
    providers.update.mockResolvedValue(createProvider({ name: 'mtn-2' }));
    const { res, statusFn, jsonFn } = createResponse();
    const dto: UpdateProviderDto = { name: 'mtn-2' };

    await controller.update('p1', dto, res);

    expect(providers.update).toHaveBeenCalledWith('p1', dto);
    expect(statusFn).toHaveBeenCalledWith(HttpStatus.OK);
    expect(jsonFn.mock.calls[0][0].data.name).toBe('mtn-2');
  });

  it('remove deletes the provider and returns a success message', async () => {
    const { providers, controller } = setup();
    providers.delete.mockResolvedValue(undefined);
    const { res, statusFn, jsonFn } = createResponse();

    await controller.remove('p1', res);

    expect(providers.delete).toHaveBeenCalledWith('p1');
    expect(statusFn).toHaveBeenCalledWith(HttpStatus.OK);
    expect(jsonFn).toHaveBeenCalledWith({ success: true, message: 'Provider deleted.', data: null });
  });
});
