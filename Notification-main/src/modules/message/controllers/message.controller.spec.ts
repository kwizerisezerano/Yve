import { HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import type { AuthContext } from '../../auth/interfaces/auth-context.interface';
import { CreateMessageDto } from '../dtos/create-message.dto';
import { Message } from '../entities/message.entity';
import type { MessageIntakeService } from '../services/message-intake.service';
import type { MessageService } from '../services/message.service';
import { MessageController } from './message.controller';

function createResponse(): { res: Response; statusFn: jest.Mock; jsonFn: jest.Mock } {
  const jsonFn = jest.fn();
  const statusFn = jest.fn().mockReturnValue({ json: jsonFn });
  const res = { status: statusFn } as unknown as Response;
  return { res, statusFn, jsonFn };
}

function createAuth(): AuthContext {
  return { tenantId: 't1', defaultSender: 'ACME' };
}

function createMessage(overrides: Partial<{ id: string; tenantId: string }> = {}): Message {
  return Message.create({
    id: overrides.id ?? 'm1',
    tenantId: overrides.tenantId ?? 't1',
    sender: 'ACME',
    recipient: '+15551234567',
    body: 'hello',
    type: 'sms',
    idempotencyKey: 'idem-1',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });
}

function setup() {
  const intake = { intake: jest.fn() } as unknown as jest.Mocked<MessageIntakeService>;
  const messages = {
    findByTenantId: jest.fn(),
    findByIdForTenant: jest.fn(),
  } as unknown as jest.Mocked<MessageService>;
  const controller = new MessageController(intake, messages);
  return { intake, messages, controller };
}

describe('MessageController', () => {
  it('create calls the intake service and shapes a 201 response with the created ids', async () => {
    const { intake, controller } = setup();
    intake.intake.mockResolvedValue(['m1', 'm2']);
    const { res, statusFn, jsonFn } = createResponse();
    const dto = new CreateMessageDto();

    await controller.create(dto, res);

    expect(intake.intake).toHaveBeenCalledWith(dto);
    expect(statusFn).toHaveBeenCalledWith(HttpStatus.CREATED);
    expect(jsonFn).toHaveBeenCalledWith({
      success: true,
      message: 'Messages queued.',
      data: { ids: ['m1', 'm2'] },
    });
  });

  it('findAll lists only the authenticated tenant\'s messages', async () => {
    const { messages, controller } = setup();
    messages.findByTenantId.mockResolvedValue([createMessage({ id: 'm1' }), createMessage({ id: 'm2' })]);
    const { res, statusFn, jsonFn } = createResponse();

    await controller.findAll(createAuth(), res);

    expect(messages.findByTenantId).toHaveBeenCalledWith('t1');
    expect(statusFn).toHaveBeenCalledWith(HttpStatus.OK);
    expect(jsonFn.mock.calls[0][0].data).toHaveLength(2);
  });

  it('findOne scopes the lookup to the authenticated tenant', async () => {
    const { messages, controller } = setup();
    messages.findByIdForTenant.mockResolvedValue(createMessage());
    const { res, statusFn, jsonFn } = createResponse();

    await controller.findOne('m1', createAuth(), res);

    expect(messages.findByIdForTenant).toHaveBeenCalledWith('m1', 't1');
    expect(statusFn).toHaveBeenCalledWith(HttpStatus.OK);
    expect(jsonFn.mock.calls[0][0].data).toMatchObject({ id: 'm1', sender: 'ACME' });
  });
});
