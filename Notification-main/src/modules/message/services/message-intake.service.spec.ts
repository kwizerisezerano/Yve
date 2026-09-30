import type { AuthService } from '../../auth/services/auth.service';
import type { AuthContext } from '../../auth/interfaces/auth-context.interface';
import { UnauthorizedDomainException } from '../../../shared/common/exceptions/unauthorized.exception';
import { ConflictDomainException } from '../../../shared/common/exceptions/conflict.exception';
import type { AppConfigService } from '../../../shared/config/app-config.service';
import type { RedisService } from '../../../shared/redis/redis.service';
import { Message } from '../entities/message.entity';
import { CreateMessageDto } from '../dtos/create-message.dto';
import { MessageIntakeService } from './message-intake.service';
import type { MessageService } from './message.service';

function createAuth(): AuthContext {
  return { tenantId: 't1', defaultSender: 'ACME' };
}

function createDto(overrides: Partial<CreateMessageDto> = {}): CreateMessageDto {
  const dto = new CreateMessageDto();
  dto.recipient = ['+15551234567', '+15557654321'];
  dto.message = 'hello';
  dto.authentication = 'raw-key';
  dto.idempotencyKey = 'idem-1';
  return Object.assign(dto, overrides);
}

function setup() {
  const authService = { authenticate: jest.fn() } as unknown as jest.Mocked<AuthService>;
  const redis = {
    reserveIdempotencyKey: jest.fn(),
    release: jest.fn(),
  } as unknown as jest.Mocked<RedisService>;
  const messageService = { create: jest.fn(), findById: jest.fn() } as unknown as jest.Mocked<MessageService>;
  const config = { idempotency: { ttlSeconds: 86400 } } as unknown as AppConfigService;
  const service = new MessageIntakeService(authService, redis, messageService, config);
  return { authService, redis, messageService, config, service };
}

describe('MessageIntakeService', () => {
  it('authenticates, reserves the idempotency key, and creates one message per recipient', async () => {
    const { authService, redis, messageService, service } = setup();
    const auth = createAuth();
    authService.authenticate.mockResolvedValue(auth);
    redis.reserveIdempotencyKey.mockResolvedValue(true);
    let counter = 0;
    messageService.create.mockImplementation((input) =>
      Promise.resolve(
        Message.create({
          id: `m${++counter}`,
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
    );

    const ids = await service.intake(createDto());

    expect(authService.authenticate).toHaveBeenCalledWith('raw-key');
    expect(redis.reserveIdempotencyKey).toHaveBeenCalledWith('idempotency:t1:idem-1', 86400);
    expect(messageService.create).toHaveBeenCalledTimes(2);
    expect(messageService.create).toHaveBeenNthCalledWith(1, {
      tenantId: 't1',
      sender: 'ACME',
      recipient: '+15551234567',
      body: 'hello',
      type: 'sms',
      idempotencyKey: 'idem-1',
    });
    expect(ids).toEqual(['m1', 'm2']);
  });

  it('uses the sender and type from the request when given, instead of the application default', async () => {
    const { authService, redis, messageService, service } = setup();
    authService.authenticate.mockResolvedValue(createAuth());
    redis.reserveIdempotencyKey.mockResolvedValue(true);
    messageService.create.mockImplementation((input) =>
      Promise.resolve(Message.create({ id: 'm1', ...input, createdAt: new Date(), updatedAt: new Date() })),
    );

    await service.intake(createDto({ recipient: ['+15551234567'], sender: 'CUSTOM', type: 'promo' }));

    expect(messageService.create).toHaveBeenCalledWith(
      expect.objectContaining({ sender: 'CUSTOM', type: 'promo' }),
    );
  });

  it('propagates authentication failure without touching Redis', async () => {
    const { authService, redis, service } = setup();
    authService.authenticate.mockRejectedValue(new UnauthorizedDomainException('Invalid api key or token.'));

    await expect(service.intake(createDto())).rejects.toBeInstanceOf(UnauthorizedDomainException);
    expect(redis.reserveIdempotencyKey).not.toHaveBeenCalled();
  });

  it('rejects a duplicate idempotency key without creating any message', async () => {
    const { authService, redis, messageService, service } = setup();
    authService.authenticate.mockResolvedValue(createAuth());
    redis.reserveIdempotencyKey.mockResolvedValue(false);

    await expect(service.intake(createDto())).rejects.toBeInstanceOf(ConflictDomainException);
    expect(messageService.create).not.toHaveBeenCalled();
  });

  it('releases the idempotency key and rethrows when message creation fails', async () => {
    const { authService, redis, messageService, service } = setup();
    authService.authenticate.mockResolvedValue(createAuth());
    redis.reserveIdempotencyKey.mockResolvedValue(true);
    const error = new Error('db down');
    messageService.create.mockRejectedValue(error);

    await expect(service.intake(createDto())).rejects.toThrow(error);
    expect(redis.release).toHaveBeenCalledWith('idempotency:t1:idem-1');
  });
});
