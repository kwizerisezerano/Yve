import { Injectable } from '@nestjs/common';
import { MessageStatus as PrismaMessageStatus, type Message as PrismaMessage } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { Message, MessageStatus } from '../entities/message.entity';
import { MessageRepository } from '../interfaces/message.repository.interface';

const TO_PRISMA_STATUS: Record<MessageStatus, PrismaMessageStatus> = {
  [MessageStatus.QUEUED]: PrismaMessageStatus.QUEUED,
  [MessageStatus.ROUTED]: PrismaMessageStatus.ROUTED,
  [MessageStatus.SUBMITTED]: PrismaMessageStatus.SUBMITTED,
  [MessageStatus.DELIVERED]: PrismaMessageStatus.DELIVERED,
  [MessageStatus.FAILED]: PrismaMessageStatus.FAILED,
  [MessageStatus.RETRYING]: PrismaMessageStatus.RETRYING,
  [MessageStatus.DEAD_LETTER]: PrismaMessageStatus.DEAD_LETTER,
};

const FROM_PRISMA_STATUS: Record<PrismaMessageStatus, MessageStatus> = {
  [PrismaMessageStatus.QUEUED]: MessageStatus.QUEUED,
  [PrismaMessageStatus.ROUTED]: MessageStatus.ROUTED,
  [PrismaMessageStatus.SUBMITTED]: MessageStatus.SUBMITTED,
  [PrismaMessageStatus.DELIVERED]: MessageStatus.DELIVERED,
  [PrismaMessageStatus.FAILED]: MessageStatus.FAILED,
  [PrismaMessageStatus.RETRYING]: MessageStatus.RETRYING,
  [PrismaMessageStatus.DEAD_LETTER]: MessageStatus.DEAD_LETTER,
};

@Injectable()
export class PrismaMessageRepository implements MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(message: Message): Promise<Message> {
    const created = await this.prisma.message.create({
      data: {
        id: message.id,
        tenantId: message.tenantId,
        sender: message.sender,
        recipient: message.recipient,
        body: message.body,
        type: message.type,
        status: TO_PRISMA_STATUS[message.status],
        provider: message.provider,
        retryCount: message.retryCount,
        idempotencyKey: message.idempotencyKey,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      },
    });
    return toDomain(created);
  }

  async findById(id: string): Promise<Message | null> {
    const found = await this.prisma.message.findUnique({ where: { id } });
    return found ? toDomain(found) : null;
  }

  async findByTenantId(tenantId: string): Promise<Message[]> {
    const found = await this.prisma.message.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return found.map(toDomain);
  }

  async updateStatus(id: string, status: MessageStatus, provider?: string | null): Promise<Message> {
    const updated = await this.prisma.message.update({
      where: { id },
      data: {
        status: TO_PRISMA_STATUS[status],
        ...(provider === undefined ? {} : { provider }),
      },
    });
    return toDomain(updated);
  }

  async incrementRetryCount(id: string): Promise<Message> {
    const updated = await this.prisma.message.update({
      where: { id },
      data: { retryCount: { increment: 1 } },
    });
    return toDomain(updated);
  }
}

function toDomain(record: PrismaMessage): Message {
  return new Message({
    id: record.id,
    tenantId: record.tenantId,
    sender: record.sender,
    recipient: record.recipient,
    body: record.body,
    type: record.type,
    status: FROM_PRISMA_STATUS[record.status],
    provider: record.provider,
    retryCount: record.retryCount,
    idempotencyKey: record.idempotencyKey,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}
