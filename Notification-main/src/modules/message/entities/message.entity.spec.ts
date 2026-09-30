import { Message, MessageStatus } from './message.entity';

const baseProps = {
  id: 'm1',
  tenantId: 't1',
  sender: 'sender-1',
  recipient: '+15551234567',
  body: 'hello',
  type: 'sms',
  idempotencyKey: 'idem-1',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('Message', () => {
  it('creates a new message queued with no provider', () => {
    const message = Message.create(baseProps);

    expect(message.status).toBe(MessageStatus.QUEUED);
    expect(message.provider).toBeNull();
    expect(message.retryCount).toBe(0);
    expect(message.id).toBe('m1');
    expect(message.tenantId).toBe('t1');
  });
});
