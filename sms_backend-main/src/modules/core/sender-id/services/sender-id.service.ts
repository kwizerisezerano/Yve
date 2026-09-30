import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/common/exceptions/entity-not-found.exception';
import { StateConflictException } from '../../../../shared/common/exceptions/state-conflict.exception';
import { SenderID, SenderIdStatus } from '../entities/sender-id.entity';
import { SENDER_ID_REPOSITORY, SenderIdRepository } from '../interfaces/sender-id-repository.interface';

@Injectable()
export class SenderIdService {
  constructor(@Inject(SENDER_ID_REPOSITORY) private readonly senderIdRepository: SenderIdRepository) {}

  async register(tenantId: string, name: string): Promise<SenderID> {
    const existing = await this.senderIdRepository.findByName(tenantId, name);
    if (existing) throw new StateConflictException(`Sender ID "${name}" already registered`);
    const senderId = SenderID.create(tenantId, name);
    return this.senderIdRepository.create(senderId);
  }

  async listByTenant(tenantId: string): Promise<SenderID[]> {
    return this.senderIdRepository.findAllByTenant(tenantId);
  }

  async approve(id: string): Promise<SenderID> {
    const senderId = await this.senderIdRepository.findById(id);
    if (!senderId) throw new EntityNotFoundException('SenderID', id);
    senderId.approve();
    return this.senderIdRepository.save(senderId);
  }

  async reject(id: string): Promise<SenderID> {
    const senderId = await this.senderIdRepository.findById(id);
    if (!senderId) throw new EntityNotFoundException('SenderID', id);
    senderId.reject();
    return this.senderIdRepository.save(senderId);
  }

  /** Used by Notification service to validate sender before dispatch */
  async validate(tenantId: string, name: string): Promise<boolean> {
    const senderId = await this.senderIdRepository.findByName(tenantId, name);
    return senderId !== null && senderId.isApproved;
  }
}
