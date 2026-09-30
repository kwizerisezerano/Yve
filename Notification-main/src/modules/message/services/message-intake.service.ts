import { Injectable } from '@nestjs/common';
import { AuthService } from '../../auth/services/auth.service';
import { ConflictDomainException } from '../../../shared/common/exceptions/conflict.exception';
import { AppConfigService } from '../../../shared/config/app-config.service';
import { RedisService } from '../../../shared/redis/redis.service';
import { CreateMessageDto } from '../dtos/create-message.dto';
import { MessageService } from './message.service';

const DEFAULT_TYPE = 'sms';

@Injectable()
export class MessageIntakeService {
  constructor(
    private readonly authService: AuthService,
    private readonly redis: RedisService,
    private readonly messageService: MessageService,
    private readonly config: AppConfigService,
  ) {}

  async intake(dto: CreateMessageDto): Promise<string[]> {
    const auth = await this.authService.authenticate(dto.authentication);

    const idempotencyRedisKey = `idempotency:${auth.tenantId}:${dto.idempotencyKey}`;
    const reserved = await this.redis.reserveIdempotencyKey(
      idempotencyRedisKey,
      this.config.idempotency.ttlSeconds,
    );
    if (!reserved) {
      throw new ConflictDomainException(
        'A request with this idempotency key has already been processed.',
      );
    }

    try {
      const ids: string[] = [];
      for (const recipient of dto.recipient) {
        const message = await this.messageService.create({
          tenantId: auth.tenantId,
          sender: dto.sender ?? auth.defaultSender,
          recipient,
          body: dto.message,
          type: dto.type ?? DEFAULT_TYPE,
          idempotencyKey: dto.idempotencyKey,
        });
        ids.push(message.id);
      }
      return ids;
    } catch (error) {
      await this.redis.release(idempotencyRedisKey);
      throw error;
    }
  }
}
