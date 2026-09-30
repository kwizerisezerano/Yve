import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateRoutingRuleDto } from './create-routing-rule.dto';

const PROVIDER_ID = 'b3f1e2a4-1c2d-4e5f-8a9b-0c1d2e3f4a5b';

async function validatePayload(payload: Record<string, unknown>) {
  const dto = plainToInstance(CreateRoutingRuleDto, payload);
  return validate(dto);
}

describe('CreateRoutingRuleDto', () => {
  it('accepts a minimal payload with just a providerId', async () => {
    const errors = await validatePayload({ providerId: PROVIDER_ID });

    expect(errors).toHaveLength(0);
  });

  it('accepts a fully specified payload', async () => {
    const errors = await validatePayload({
      providerId: PROVIDER_ID,
      country: 'RW',
      operator: 'MTN',
      type: 'sms',
      action: 'block',
      priority: 10,
      cost: 0.02,
    });

    expect(errors).toHaveLength(0);
  });

  it('rejects a missing providerId', async () => {
    const errors = await validatePayload({});

    expect(errors.some((e) => e.property === 'providerId')).toBe(true);
  });

  it('rejects a providerId that is not a uuid', async () => {
    const errors = await validatePayload({ providerId: 'not-a-uuid' });

    expect(errors.some((e) => e.property === 'providerId')).toBe(true);
  });

  it('rejects a country that is not a 2 letter uppercase code', async () => {
    const errors = await validatePayload({ providerId: PROVIDER_ID, country: 'rwanda' });

    expect(errors.some((e) => e.property === 'country')).toBe(true);
  });

  it('rejects an action outside allow or block', async () => {
    const errors = await validatePayload({ providerId: PROVIDER_ID, action: 'maybe' });

    expect(errors.some((e) => e.property === 'action')).toBe(true);
  });

  it('rejects a negative cost', async () => {
    const errors = await validatePayload({ providerId: PROVIDER_ID, cost: -1 });

    expect(errors.some((e) => e.property === 'cost')).toBe(true);
  });
});
