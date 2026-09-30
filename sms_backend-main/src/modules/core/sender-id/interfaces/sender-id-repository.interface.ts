import { SenderID } from '../entities/sender-id.entity';

export const SENDER_ID_REPOSITORY = 'SENDER_ID_REPOSITORY';

export interface SenderIdRepository {
  create(senderId: SenderID): Promise<SenderID>;
  findById(id: string): Promise<SenderID | null>;
  findByName(tenantId: string, name: string): Promise<SenderID | null>;
  findAllByTenant(tenantId: string): Promise<SenderID[]>;
  save(senderId: SenderID): Promise<SenderID>;
}
