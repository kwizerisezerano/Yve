import { NotFoundDomainException } from '../../../shared/common/exceptions/not-found.exception';
import { Message, MessageStatus } from '../entities/message.entity';
import type { MessageRepository } from '../interfaces/message.repository.interface';
import { MessageLifecycleService } from './message-lifecycle.service';
import { CreateMessageInput, MessageService } from './message.service';

describe('MessageService', () => {
  const input: CreateMessageInput = {
    tenantId: 't1',
    sender: 'sender-1',
    recipient: '+15551234567',
    body: 'hello',
    type: 'sms',
    idempotencyKey: 'idem-1',
  };

  function setup() {
    const repository: jest.Mocked<MessageRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findByTenantId: jest.fn(),
      updateStatus: jest.fn(),
      incrementRetryCount: jest.fn(),
    };
    const lifecycle = { announceQueued: jest.fn() } as unknown as jest.Mocked<MessageLifecycleService>;
    const service = new MessageService(repository, lifecycle);
    return { repository, lifecycle, service };
  }

  it('persists a queued message built from the input and announces it queued', async () => {
    const { repository, lifecycle, service } = setup();
    repository.create.mockImplementation((message) => Promise.resolve(message));

    const result = await service.create(input);

    expect(repository.create).toHaveBeenCalledTimes(1);
    const persisted = repository.create.mock.calls[0][0];
    expect(persisted.status).toBe(MessageStatus.QUEUED);
    expect(persisted.provider).toBeNull();
    expect(persisted.tenantId).toBe('t1');
    expect(persisted.idempotencyKey).toBe('idem-1');

    expect(lifecycle.announceQueued).toHaveBeenCalledWith(result);
    expect(result.status).toBe(MessageStatus.QUEUED);
  });

  it('findById delegates to the repository', async () => {
    const { repository, service } = setup();
    const message = Message.create({
      id: 'm1',
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    repository.findById.mockResolvedValue(message);

    const result = await service.findById('m1');

    expect(repository.findById).toHaveBeenCalledWith('m1');
    expect(result).toBe(message);
  });

  it('findByTenantId delegates to the repository', async () => {
    const { repository, service } = setup();
    repository.findByTenantId.mockResolvedValue([]);

    await service.findByTenantId('t1');

    expect(repository.findByTenantId).toHaveBeenCalledWith('t1');
  });

  it('findByIdForTenant returns the message when it belongs to the tenant', async () => {
    const { repository, service } = setup();
    const message = Message.create({ id: 'm1', ...input, createdAt: new Date(), updatedAt: new Date() });
    repository.findById.mockResolvedValue(message);

    const result = await service.findByIdForTenant('m1', 't1');

    expect(result).toBe(message);
  });

  it('findByIdForTenant throws NotFoundDomainException when the message does not exist', async () => {
    const { repository, service } = setup();
    repository.findById.mockResolvedValue(null);

    await expect(service.findByIdForTenant('missing', 't1')).rejects.toBeInstanceOf(
      NotFoundDomainException,
    );
  });

  it('findByIdForTenant throws NotFoundDomainException when the message belongs to a different tenant', async () => {
    const { repository, service } = setup();
    const message = Message.create({
      id: 'm1',
      ...input,
      tenantId: 't2',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    repository.findById.mockResolvedValue(message);

    await expect(service.findByIdForTenant('m1', 't1')).rejects.toBeInstanceOf(NotFoundDomainException);
  });

  it('incrementRetryCount delegates to the repository', async () => {
    const { repository, service } = setup();
    const message = Message.create({ id: 'm1', ...input, createdAt: new Date(), updatedAt: new Date() });
    repository.incrementRetryCount.mockResolvedValue(message);

    const result = await service.incrementRetryCount('m1');

    expect(repository.incrementRetryCount).toHaveBeenCalledWith('m1');
    expect(result).toBe(message);
  });
});
