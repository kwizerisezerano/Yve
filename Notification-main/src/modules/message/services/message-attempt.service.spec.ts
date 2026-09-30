import { AttemptStatus, MessageAttempt } from '../entities/message-attempt.entity';
import type { MessageAttemptRepository } from '../interfaces/message-attempt.repository.interface';
import { MessageAttemptService } from './message-attempt.service';

function setup() {
  const repository: jest.Mocked<MessageAttemptRepository> = {
    create: jest.fn(),
    findByMessageId: jest.fn(),
    updateOutcome: jest.fn(),
  };
  const service = new MessageAttemptService(repository);
  return { repository, service };
}

describe('MessageAttemptService', () => {
  it('records the first attempt as attempt number 1 when there are no prior attempts', async () => {
    const { repository, service } = setup();
    repository.findByMessageId.mockResolvedValue([]);
    repository.create.mockImplementation((attempt) => Promise.resolve(attempt));

    const attempt = await service.recordAttempt('m1', 'provider-a');

    expect(attempt.attemptNumber).toBe(1);
    expect(attempt.messageId).toBe('m1');
    expect(attempt.provider).toBe('provider-a');
    expect(attempt.status).toBe(AttemptStatus.PENDING);
  });

  it('numbers a new attempt one past the existing count', async () => {
    const { repository, service } = setup();
    repository.findByMessageId.mockResolvedValue([
      MessageAttempt.create({ id: 'a1', messageId: 'm1', provider: 'provider-a', attemptNumber: 1, createdAt: new Date() }),
      MessageAttempt.create({ id: 'a2', messageId: 'm1', provider: 'provider-a', attemptNumber: 2, createdAt: new Date() }),
    ]);
    repository.create.mockImplementation((attempt) => Promise.resolve(attempt));

    const attempt = await service.recordAttempt('m1', 'provider-b');

    expect(attempt.attemptNumber).toBe(3);
  });

  it('completeAttempt delegates to the repository with the given outcome', async () => {
    const { repository, service } = setup();
    const completed = MessageAttempt.create({
      id: 'a1',
      messageId: 'm1',
      provider: 'provider-a',
      attemptNumber: 1,
      createdAt: new Date(),
    }).withOutcome(AttemptStatus.FAILED, 'PROVIDER_TIMEOUT');
    repository.updateOutcome.mockResolvedValue(completed);

    const result = await service.completeAttempt('a1', AttemptStatus.FAILED, 'PROVIDER_TIMEOUT');

    expect(repository.updateOutcome).toHaveBeenCalledWith('a1', AttemptStatus.FAILED, 'PROVIDER_TIMEOUT');
    expect(result).toBe(completed);
  });

  it('attemptsFor delegates to the repository', async () => {
    const { repository, service } = setup();
    repository.findByMessageId.mockResolvedValue([]);

    await service.attemptsFor('m1');

    expect(repository.findByMessageId).toHaveBeenCalledWith('m1');
  });
});
