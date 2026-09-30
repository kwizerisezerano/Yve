import { Injectable } from '@nestjs/common';
import {
  AttemptStatus as PrismaAttemptStatus,
  type MessageAttempt as PrismaMessageAttempt,
} from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AttemptStatus, MessageAttempt } from '../entities/message-attempt.entity';
import { MessageAttemptRepository } from '../interfaces/message-attempt.repository.interface';

const TO_PRISMA_STATUS: Record<AttemptStatus, PrismaAttemptStatus> = {
  [AttemptStatus.PENDING]: PrismaAttemptStatus.PENDING,
  [AttemptStatus.SUCCEEDED]: PrismaAttemptStatus.SUCCEEDED,
  [AttemptStatus.FAILED]: PrismaAttemptStatus.FAILED,
};

const FROM_PRISMA_STATUS: Record<PrismaAttemptStatus, AttemptStatus> = {
  [PrismaAttemptStatus.PENDING]: AttemptStatus.PENDING,
  [PrismaAttemptStatus.SUCCEEDED]: AttemptStatus.SUCCEEDED,
  [PrismaAttemptStatus.FAILED]: AttemptStatus.FAILED,
};

@Injectable()
export class PrismaMessageAttemptRepository implements MessageAttemptRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(attempt: MessageAttempt): Promise<MessageAttempt> {
    const created = await this.prisma.messageAttempt.create({
      data: {
        id: attempt.id,
        messageId: attempt.messageId,
        provider: attempt.provider,
        attemptNumber: attempt.attemptNumber,
        status: TO_PRISMA_STATUS[attempt.status],
        errorCode: attempt.errorCode,
        createdAt: attempt.createdAt,
        completedAt: attempt.completedAt,
      },
    });
    return toDomain(created);
  }

  async findByMessageId(messageId: string): Promise<MessageAttempt[]> {
    const found = await this.prisma.messageAttempt.findMany({
      where: { messageId },
      orderBy: { attemptNumber: 'asc' },
    });
    return found.map(toDomain);
  }

  async updateOutcome(
    id: string,
    status: AttemptStatus.SUCCEEDED | AttemptStatus.FAILED,
    errorCode: string | null,
  ): Promise<MessageAttempt> {
    const updated = await this.prisma.messageAttempt.update({
      where: { id },
      data: {
        status: TO_PRISMA_STATUS[status],
        errorCode,
        completedAt: new Date(),
      },
    });
    return toDomain(updated);
  }
}

function toDomain(record: PrismaMessageAttempt): MessageAttempt {
  return new MessageAttempt({
    id: record.id,
    messageId: record.messageId,
    provider: record.provider,
    attemptNumber: record.attemptNumber,
    status: FROM_PRISMA_STATUS[record.status],
    errorCode: record.errorCode,
    createdAt: record.createdAt,
    updatedAt: record.completedAt ?? record.createdAt,
    completedAt: record.completedAt,
  });
}
