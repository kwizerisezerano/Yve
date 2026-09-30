import { Tenant, TenantStatus } from '../../auth/entities/tenant.entity';
import type { TenantService } from '../../auth/services/tenant.service';
import { WebhookClient } from './webhook-client.service';
import { WebhookService } from './webhook.service';

function createTenant(webhookUrl: string | null): Tenant {
  return new Tenant({
    id: 't1',
    name: 'Acme',
    phone: '+15551234567',
    apiKeyHash: 'hash-1',
    defaultSender: 'ACME',
    webhookUrl,
    status: TenantStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function setup() {
  const tenants = { findById: jest.fn() } as unknown as jest.Mocked<TenantService>;
  const client = { deliver: jest.fn() } as unknown as jest.Mocked<WebhookClient>;
  const service = new WebhookService(tenants, client);
  return { tenants, client, service };
}

describe('WebhookService', () => {
  it('delivers the payload to the tenant webhook url when one is set', async () => {
    const { tenants, client, service } = setup();
    tenants.findById.mockResolvedValue(createTenant('https://example.com/hook'));

    await service.notify('t1', { messageId: 'm1', status: 'delivered' });

    expect(client.deliver).toHaveBeenCalledWith('https://example.com/hook', {
      messageId: 'm1',
      status: 'delivered',
    });
  });

  it('does nothing when the tenant has no webhook url configured', async () => {
    const { tenants, client, service } = setup();
    tenants.findById.mockResolvedValue(createTenant(null));

    await service.notify('t1', { messageId: 'm1', status: 'delivered' });

    expect(client.deliver).not.toHaveBeenCalled();
  });

  it('swallows a delivery failure rather than throwing', async () => {
    const { tenants, client, service } = setup();
    tenants.findById.mockResolvedValue(createTenant('https://example.com/hook'));
    client.deliver.mockRejectedValue(new Error('network down'));

    await expect(service.notify('t1', { messageId: 'm1', status: 'failed' })).resolves.toBeUndefined();
  });
});
