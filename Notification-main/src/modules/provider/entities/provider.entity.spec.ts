import { Provider, ProviderStatus } from './provider.entity';

describe('Provider', () => {
  it('create builds an active provider with updatedAt equal to createdAt', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');

    const provider = Provider.create({
      id: 'p1',
      name: 'mtn',
      description: null,
      defaultCost: null,
      createdAt,
    });

    expect(provider.status).toBe(ProviderStatus.ACTIVE);
    expect(provider.updatedAt).toEqual(createdAt);
  });

  it('isActive is true only for an active provider', () => {
    const active = new Provider({
      id: 'p1',
      name: 'mtn',
      description: null,
      defaultCost: null,
      status: ProviderStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const disabled = new Provider({
      id: 'p2',
      name: 'mtn',
      description: null,
      defaultCost: null,
      status: ProviderStatus.DISABLED,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(active.isActive()).toBe(true);
    expect(disabled.isActive()).toBe(false);
  });

  it('withUpdates returns a new instance with the changes applied and updatedAt bumped', () => {
    const provider = Provider.create({
      id: 'p1',
      name: 'mtn',
      description: null,
      defaultCost: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    const updated = provider.withUpdates({ defaultCost: 0.02, status: ProviderStatus.DISABLED });

    expect(updated).not.toBe(provider);
    expect(updated.defaultCost).toBe(0.02);
    expect(updated.status).toBe(ProviderStatus.DISABLED);
    expect(updated.name).toBe('mtn');
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(provider.updatedAt.getTime());
    expect(provider.defaultCost).toBeNull();
  });
});
