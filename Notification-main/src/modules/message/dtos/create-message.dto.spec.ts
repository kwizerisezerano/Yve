import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateMessageDto } from './create-message.dto';

const validPayload = {
  recipient: '+15551234567',
  message: 'hello',
  authentication: 'raw-key',
  idempotencyKey: 'idem-1',
};

async function validatePayload(payload: Record<string, unknown>) {
  const dto = plainToInstance(CreateMessageDto, payload);
  return validate(dto);
}

describe('CreateMessageDto', () => {
  it('accepts a valid payload with a single recipient, normalized into an array', async () => {
    const dto = plainToInstance(CreateMessageDto, validPayload);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.recipient).toEqual(['+15551234567']);
  });

  it('accepts a valid payload with multiple recipients', async () => {
    const errors = await validatePayload({ ...validPayload, recipient: ['+15551234567', '+15557654321'] });

    expect(errors).toHaveLength(0);
  });

  it('rejects an empty recipient list', async () => {
    const errors = await validatePayload({ ...validPayload, recipient: [] });

    expect(errors.some((e) => e.property === 'recipient')).toBe(true);
  });

  it('rejects a malformed recipient number', async () => {
    const errors = await validatePayload({ ...validPayload, recipient: 'not-a-number' });

    expect(errors.some((e) => e.property === 'recipient')).toBe(true);
  });

  it('rejects a missing message', async () => {
    const { message: _omit, ...rest } = validPayload;
    const errors = await validatePayload(rest);

    expect(errors.some((e) => e.property === 'message')).toBe(true);
  });

  it('rejects a missing authentication', async () => {
    const { authentication: _omit, ...rest } = validPayload;
    const errors = await validatePayload(rest);

    expect(errors.some((e) => e.property === 'authentication')).toBe(true);
  });

  it('rejects a missing idempotency key', async () => {
    const { idempotencyKey: _omit, ...rest } = validPayload;
    const errors = await validatePayload(rest);

    expect(errors.some((e) => e.property === 'idempotencyKey')).toBe(true);
  });

  it('accepts an optional sender and type', async () => {
    const errors = await validatePayload({ ...validPayload, sender: 'ACME', type: 'promo' });

    expect(errors).toHaveLength(0);
  });
});
