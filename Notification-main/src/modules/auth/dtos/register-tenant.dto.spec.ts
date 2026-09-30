import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterTenantDto } from './register-tenant.dto';

const validPayload = {
  name: 'Acme Inc',
  phone: '+15551234567',
};

async function validatePayload(payload: Record<string, unknown>) {
  const dto = plainToInstance(RegisterTenantDto, payload);
  return validate(dto);
}

describe('RegisterTenantDto', () => {
  it('accepts a valid payload with just name and phone', async () => {
    const errors = await validatePayload(validPayload);

    expect(errors).toHaveLength(0);
  });

  it('accepts an optional defaultSender', async () => {
    const errors = await validatePayload({ ...validPayload, defaultSender: 'ACME' });

    expect(errors).toHaveLength(0);
  });

  it('rejects a missing name', async () => {
    const { name: _omit, ...rest } = validPayload;
    const errors = await validatePayload(rest);

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('rejects a missing phone', async () => {
    const { phone: _omit, ...rest } = validPayload;
    const errors = await validatePayload(rest);

    expect(errors.some((e) => e.property === 'phone')).toBe(true);
  });

  it('rejects a malformed phone number', async () => {
    const errors = await validatePayload({ ...validPayload, phone: 'not-a-number' });

    expect(errors.some((e) => e.property === 'phone')).toBe(true);
  });
});
