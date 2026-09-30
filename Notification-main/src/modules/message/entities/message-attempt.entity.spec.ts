import { AttemptStatus, MessageAttempt } from './message-attempt.entity';

const baseProps = {
  id: 'a1',
  messageId: 'm1',
  provider: 'provider-a',
  attemptNumber: 1,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('MessageAttempt', () => {
  it('creates a new attempt pending with no error and no completedAt', () => {
    const attempt = MessageAttempt.create(baseProps);

    expect(attempt.status).toBe(AttemptStatus.PENDING);
    expect(attempt.errorCode).toBeNull();
    expect(attempt.completedAt).toBeNull();
    expect(attempt.attemptNumber).toBe(1);
  });

  it('withOutcome marks the attempt succeeded and stamps completedAt', () => {
    const attempt = MessageAttempt.create(baseProps);

    const succeeded = attempt.withOutcome(AttemptStatus.SUCCEEDED, null);

    expect(succeeded).not.toBe(attempt);
    expect(succeeded.status).toBe(AttemptStatus.SUCCEEDED);
    expect(succeeded.errorCode).toBeNull();
    expect(succeeded.completedAt).not.toBeNull();
    expect(attempt.status).toBe(AttemptStatus.PENDING);
  });

  it('withOutcome marks the attempt failed with an error code', () => {
    const attempt = MessageAttempt.create(baseProps);

    const failed = attempt.withOutcome(AttemptStatus.FAILED, 'PROVIDER_TIMEOUT');

    expect(failed.status).toBe(AttemptStatus.FAILED);
    expect(failed.errorCode).toBe('PROVIDER_TIMEOUT');
  });
});
