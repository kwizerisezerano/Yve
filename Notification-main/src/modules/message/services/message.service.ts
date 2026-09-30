import { randomUUID } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { NotFoundDomainException } from '../../../shared/common/exceptions/not-found.exception';
import { Message } from '../entities/message.entity';
import {
  MESSAGE_REPOSITORY,
  type MessageRepository,
} from '../interfaces/message.repository.interface';
import { MessageLifecycleService } from './message-lifecycle.service';

export interface CreateMessageInput {
  tenantId: string;
  sender: string;
  recipient: string;
  body: string;
  type: string;
  idempotencyKey: string;
}

@Injectable()
export class MessageService {
  constructor(
    @Inject(MESSAGE_REPOSITORY) private readonly repository: MessageRepository,
    private readonly lifecycle: MessageLifecycleService,
  ) {}

  async create(input: CreateMessageInput): Promise<Message> {
    const now = new Date();
    const message = Message.create({
      id: randomUUID(),
      tenantId: input.tenantId,
      sender: input.sender,
      recipient: input.recipient,
      body: input.body,
      type: input.type,
      idempotencyKey: input.idempotencyKey,
      createdAt: now,
      updatedAt: now,
    });

    const created = await this.repository.create(message);
    this.lifecycle.announceQueued(created);
    return created;
  }

  findById(id: string): Promise<Message | null> {
    return this.repository.findById(id);
  }

  findByTenantId(tenantId: string): Promise<Message[]> {
    return this.repository.findByTenantId(tenantId);
  }

  async findByIdForTenant(id: string, tenantId: string): Promise<Message> {
    const message = await this.repository.findById(id);
    if (!message || message.tenantId !== tenantId) {
      throw new NotFoundDomainException(`Message ${id} not found.`);
    }
    return message;
  }

  incrementRetryCount(id: string): Promise<Message> {
    return this.repository.incrementRetryCount(id);
  }
}
