import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SetTenantWebhookDto } from './set-tenant-webhook.dto';

async function validatePayload(payload: Record<string, unknown>) {
  const dto = plainToInstance(SetTenantWebhookDto, payload);
  return validate(dto);
}

describe('SetTenantWebhookDto', () => {
  it('accepts a valid https url', async () => {
    const errors = await validatePayload({ webhookUrl: 'https://example.com/webhooks/notification' });

    expect(errors).toHaveLength(0);
  });

  it('accepts a local url without a top level domain, for local dev', async () => {
    const errors = await validatePayload({ webhookUrl: 'http://localhost:4000/hook' });

    expect(errors).toHaveLength(0);
  });

  it('rejects a missing webhookUrl', async () => {
    const errors = await validatePayload({});

    expect(errors.some((e) => e.property === 'webhookUrl')).toBe(true);
  });

  it('rejects a value that is not a url', async () => {
    const errors = await validatePayload({ webhookUrl: 'not-a-url' });

    expect(errors.some((e) => e.property === 'webhookUrl')).toBe(true);
  });
});
