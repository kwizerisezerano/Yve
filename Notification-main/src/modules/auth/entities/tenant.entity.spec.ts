import { Tenant, TenantStatus } from './tenant.entity';

describe('Tenant', () => {
  it('create builds an active tenant with updatedAt equal to createdAt', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');

    const tenant = Tenant.create({
      id: 't1',
      name: 'Acme',
      phone: '+15551234567',
      apiKeyHash: 'hash-1',
      defaultSender: 'ACME',
      createdAt,
    });

    expect(tenant.status).toBe(TenantStatus.ACTIVE);
    expect(tenant.updatedAt).toEqual(createdAt);
  });

  it('isActive is true only for an active tenant', () => {
    const active = new Tenant({
      id: 't1',
      name: 'Acme',
      phone: '+15551234567',
      apiKeyHash: 'hash-1',
      defaultSender: 'ACME',
      webhookUrl: null,
      status: TenantStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const disabled = new Tenant({
      id: 't2',
      name: 'Acme',
      phone: '+15551234567',
      apiKeyHash: 'hash-2',
      defaultSender: 'ACME',
      webhookUrl: null,
      status: TenantStatus.DISABLED,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(active.isActive()).toBe(true);
    expect(disabled.isActive()).toBe(false);
  });

  it('withUpdates returns a new instance with the changes applied and updatedAt bumped', () => {
    const tenant = Tenant.create({
      id: 't1',
      name: 'Acme',
      phone: '+15551234567',
      apiKeyHash: 'hash-1',
      defaultSender: 'ACME',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    const updated = tenant.withUpdates({ name: 'New Name', status: TenantStatus.DISABLED });

    expect(updated).not.toBe(tenant);
    expect(updated.name).toBe('New Name');
    expect(updated.status).toBe(TenantStatus.DISABLED);
    expect(updated.phone).toBe('+15551234567');
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(tenant.updatedAt.getTime());
    expect(tenant.name).toBe('Acme');
  });

  it('withUpdates can set and clear the webhook url', () => {
    const tenant = Tenant.create({
      id: 't1',
      name: 'Acme',
      phone: '+15551234567',
      apiKeyHash: 'hash-1',
      defaultSender: 'ACME',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    expect(tenant.webhookUrl).toBeNull();

    const withHook = tenant.withUpdates({ webhookUrl: 'https://example.com/hook' });
    expect(withHook.webhookUrl).toBe('https://example.com/hook');

    const cleared = withHook.withUpdates({ webhookUrl: null });
    expect(cleared.webhookUrl).toBeNull();
  });

  it('withNewApiKey returns a new instance with only the api key hash changed', () => {
    const tenant = Tenant.create({
      id: 't1',
      name: 'Acme',
      phone: '+15551234567',
      apiKeyHash: 'hash-1',
      defaultSender: 'ACME',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    const updated = tenant.withNewApiKey('hash-2');

    expect(updated).not.toBe(tenant);
    expect(updated.apiKeyHash).toBe('hash-2');
    expect(updated.name).toBe('Acme');
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(tenant.updatedAt.getTime());
    expect(tenant.apiKeyHash).toBe('hash-1');
  });
});
