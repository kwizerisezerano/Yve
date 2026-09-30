import { HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { Tenant, TenantStatus } from '../entities/tenant.entity';
import { RegisterTenantDto } from '../dtos/register-tenant.dto';
import { SetTenantWebhookDto } from '../dtos/set-tenant-webhook.dto';
import { UpdateTenantDto } from '../dtos/update-tenant.dto';
import type { TenantRegistrationService } from '../services/tenant-registration.service';
import type { TenantService } from '../services/tenant.service';
import { TenantController } from './tenant.controller';

function createResponse(): { res: Response; statusFn: jest.Mock; jsonFn: jest.Mock } {
  const jsonFn = jest.fn();
  const statusFn = jest.fn().mockReturnValue({ json: jsonFn });
  const res = { status: statusFn } as unknown as Response;
  return { res, statusFn, jsonFn };
}

function createTenant(overrides: Partial<{ id: string; name: string }> = {}): Tenant {
  return new Tenant({
    id: overrides.id ?? 't1',
    name: overrides.name ?? 'Acme',
    phone: '+15551234567',
    apiKeyHash: 'hash-1',
    defaultSender: 'ACME',
    webhookUrl: null,
    status: TenantStatus.ACTIVE,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });
}

function setup() {
  const registration = {
    register: jest.fn(),
    regenerateKey: jest.fn(),
  } as unknown as jest.Mocked<TenantRegistrationService>;
  const tenants = {
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<TenantService>;
  const controller = new TenantController(registration, tenants);
  return { registration, tenants, controller };
}

describe('TenantController', () => {
  it('create calls the registration service and shapes a 201 response including the raw api key', async () => {
    const { registration, controller } = setup();
    registration.register.mockResolvedValue({ tenant: createTenant(), rawApiKey: 'ntf_raw-key' });
    const { res, statusFn, jsonFn } = createResponse();
    const dto = new RegisterTenantDto();
    dto.name = 'Acme';
    dto.phone = '+15551234567';

    await controller.create(dto, res);

    expect(registration.register).toHaveBeenCalledWith(dto);
    expect(statusFn).toHaveBeenCalledWith(HttpStatus.CREATED);
    expect(jsonFn).toHaveBeenCalledWith({
      success: true,
      message: 'Tenant registered.',
      data: {
        tenantId: 't1',
        name: 'Acme',
        phone: '+15551234567',
        defaultSender: 'ACME',
        apiKey: 'ntf_raw-key',
      },
    });
  });

  it('findAll lists tenants', async () => {
    const { tenants, controller } = setup();
    tenants.findAll.mockResolvedValue([createTenant({ id: 't1' }), createTenant({ id: 't2' })]);
    const { res, statusFn, jsonFn } = createResponse();

    await controller.findAll(res);

    expect(statusFn).toHaveBeenCalledWith(HttpStatus.OK);
    const body = jsonFn.mock.calls[0][0];
    expect(body.data).toHaveLength(2);
  });

  it('findOne returns a single tenant summary', async () => {
    const { tenants, controller } = setup();
    tenants.findById.mockResolvedValue(createTenant());
    const { res, statusFn, jsonFn } = createResponse();

    await controller.findOne('t1', res);

    expect(tenants.findById).toHaveBeenCalledWith('t1');
    expect(statusFn).toHaveBeenCalledWith(HttpStatus.OK);
    expect(jsonFn.mock.calls[0][0].data).toMatchObject({ id: 't1', name: 'Acme' });
  });

  it('update forwards the changes and returns the updated summary', async () => {
    const { tenants, controller } = setup();
    tenants.update.mockResolvedValue(createTenant({ name: 'New Name' }));
    const { res, statusFn, jsonFn } = createResponse();
    const dto: UpdateTenantDto = { name: 'New Name' };

    await controller.update('t1', dto, res);

    expect(tenants.update).toHaveBeenCalledWith('t1', dto);
    expect(statusFn).toHaveBeenCalledWith(HttpStatus.OK);
    expect(jsonFn.mock.calls[0][0].data.name).toBe('New Name');
  });

  it('getWebhook returns the tenant\'s current webhook url', async () => {
    const { tenants, controller } = setup();
    tenants.findById.mockResolvedValue(createTenant());
    const { res, statusFn, jsonFn } = createResponse();

    await controller.getWebhook('t1', res);

    expect(tenants.findById).toHaveBeenCalledWith('t1');
    expect(statusFn).toHaveBeenCalledWith(HttpStatus.OK);
    expect(jsonFn).toHaveBeenCalledWith({
      success: true,
      message: 'Tenant webhook found.',
      data: { webhookUrl: null },
    });
  });

  it('setWebhook updates the tenant and returns the new webhook url', async () => {
    const { tenants, controller } = setup();
    const withHook = new Tenant({
      id: 't1',
      name: 'Acme',
      phone: '+15551234567',
      apiKeyHash: 'hash-1',
      defaultSender: 'ACME',
      webhookUrl: 'https://example.com/hook',
      status: TenantStatus.ACTIVE,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    tenants.update.mockResolvedValue(withHook);
    const { res, statusFn, jsonFn } = createResponse();
    const dto: SetTenantWebhookDto = { webhookUrl: 'https://example.com/hook' };

    await controller.setWebhook('t1', dto, res);

    expect(tenants.update).toHaveBeenCalledWith('t1', { webhookUrl: 'https://example.com/hook' });
    expect(statusFn).toHaveBeenCalledWith(HttpStatus.OK);
    expect(jsonFn).toHaveBeenCalledWith({
      success: true,
      message: 'Tenant webhook set.',
      data: { webhookUrl: 'https://example.com/hook' },
    });
  });

  it('regenerateKey calls the registration service and returns the new raw key', async () => {
    const { registration, controller } = setup();
    registration.regenerateKey.mockResolvedValue({ tenant: createTenant(), rawApiKey: 'ntf_new-key' });
    const { res, statusFn, jsonFn } = createResponse();

    await controller.regenerateKey('t1', res);

    expect(registration.regenerateKey).toHaveBeenCalledWith('t1');
    expect(statusFn).toHaveBeenCalledWith(HttpStatus.CREATED);
    expect(jsonFn).toHaveBeenCalledWith({
      success: true,
      message: 'Api key regenerated.',
      data: { tenantId: 't1', apiKey: 'ntf_new-key' },
    });
  });

  it('remove deletes the tenant and returns a success message', async () => {
    const { tenants, controller } = setup();
    tenants.delete.mockResolvedValue(undefined);
    const { res, statusFn, jsonFn } = createResponse();

    await controller.remove('t1', res);

    expect(tenants.delete).toHaveBeenCalledWith('t1');
    expect(statusFn).toHaveBeenCalledWith(HttpStatus.OK);
    expect(jsonFn).toHaveBeenCalledWith({ success: true, message: 'Tenant deleted.', data: null });
  });
});
