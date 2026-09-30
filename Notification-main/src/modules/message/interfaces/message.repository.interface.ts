import { Message, MessageStatus } from '../entities/message.entity';

export const MESSAGE_REPOSITORY = Symbol('MESSAGE_REPOSITORY');

export interface MessageRepository {
  create(message: Message): Promise<Message>;
  findById(id: string): Promise<Message | null>;
  findByTenantId(tenantId: string): Promise<Message[]>;
  updateStatus(id: string, status: MessageStatus, provider?: string | null): Promise<Message>;
  incrementRetryCount(id: string): Promise<Message>;
}
