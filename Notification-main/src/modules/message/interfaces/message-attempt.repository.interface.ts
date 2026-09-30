import { AttemptStatus, MessageAttempt } from '../entities/message-attempt.entity';

export const MESSAGE_ATTEMPT_REPOSITORY = Symbol('MESSAGE_ATTEMPT_REPOSITORY');

export interface MessageAttemptRepository {
  create(attempt: MessageAttempt): Promise<MessageAttempt>;
  findByMessageId(messageId: string): Promise<MessageAttempt[]>;
  updateOutcome(
    id: string,
    status: AttemptStatus.SUCCEEDED | AttemptStatus.FAILED,
    errorCode: string | null,
  ): Promise<MessageAttempt>;
}
