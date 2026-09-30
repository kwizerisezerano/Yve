import { randomUUID } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { AttemptStatus, MessageAttempt } from '../entities/message-attempt.entity';
import {
  MESSAGE_ATTEMPT_REPOSITORY,
  type MessageAttemptRepository,
} from '../interfaces/message-attempt.repository.interface';

@Injectable()
export class MessageAttemptService {
  constructor(
    @Inject(MESSAGE_ATTEMPT_REPOSITORY) private readonly repository: MessageAttemptRepository,
  ) {}

  async recordAttempt(messageId: string, provider: string): Promise<MessageAttempt> {
    const existing = await this.repository.findByMessageId(messageId);
    const attempt = MessageAttempt.create({
      id: randomUUID(),
      messageId,
      provider,
      attemptNumber: existing.length + 1,
      createdAt: new Date(),
    });
    return this.repository.create(attempt);
  }

  completeAttempt(
    attemptId: string,
    status: AttemptStatus.SUCCEEDED | AttemptStatus.FAILED,
    errorCode: string | null = null,
  ): Promise<MessageAttempt> {
    return this.repository.updateOutcome(attemptId, status, errorCode);
  }

  attemptsFor(messageId: string): Promise<MessageAttempt[]> {
    return this.repository.findByMessageId(messageId);
  }
}
