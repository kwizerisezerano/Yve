import { HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { Provider, ProviderStatus } from '../../provider/entities/provider.entity';
import type { ProviderService } from '../../provider/services/provider.service';
import { CreateRoutingRuleDto } from '../dtos/create-routing-rule.dto';
import { UpdateRoutingRuleDto } from '../dtos/update-routing-rule.dto';
import { RoutingRule, RoutingRuleAction, RoutingRuleStatus } from '../entities/routing-rule.entity';
import type { RoutingRuleService } from '../services/routing-rule.service';
import { RoutingRuleController } from './routing-rule.controller';

function createResponse(): { res: Response; statusFn: jest.Mock; jsonFn: jest.Mock } {
  const jsonFn = jest.fn();
  const statusFn = jest.fn().mockReturnValue({ json: jsonFn });
  const res = { status: statusFn } as unknown as Response;
  return { res, statusFn, jsonFn };
}

function createRule(overrides: Partial<{ id: string; priority: number }> = {}): RoutingRule {
  return new RoutingRule({
    id: overrides.id ?? 'r1',
    country: 'RW',
    operator: null,
    type: 'sms',
    providerId: 'p1',
    action: RoutingRuleAction.ALLOW,
    priority: overrides.priority ?? 10,
    cost: 0.02,
    status: RoutingRuleStatus.ACTIVE,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });
}

function createProvider(): Provider {
  return new Provider({
    id: 'p1',
    name: 'provider-a',
    description: null,
    defaultCost: null,
    status: ProviderStatus.ACTIVE,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });
}

function setup() {
  const rules = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<RoutingRuleService>;
  const providers = {
    findById: jest.fn().mockResolvedValue(createProvider()),
    findByIds: jest.fn().mockResolvedValue([createProvider()]),
  } as unknown as jest.Mocked<ProviderService>;
  const controller = new RoutingRuleController(rules, providers);
  return { rules, providers, controller };
}

describe('RoutingRuleController', () => {
  it('create calls the service and shapes a 201 response', async () => {
    const { rules, controller } = setup();
    rules.create.mockResolvedValue(createRule());
    const { res, statusFn, jsonFn } = createResponse();
    const dto: CreateRoutingRuleDto = { providerId: 'p1' };

    await controller.create(dto, res);

    expect(rules.create).toHaveBeenCalledWith(dto);
    expect(statusFn).toHaveBeenCalledWith(HttpStatus.CREATED);
    expect(jsonFn.mock.calls[0][0].data).toMatchObject({
      id: 'r1',
      providerId: 'p1',
      providerName: 'provider-a',
    });
  });

  it('findAll lists rules', async () => {
    const { rules, controller } = setup();
    rules.findAll.mockResolvedValue([createRule({ id: 'r1' }), createRule({ id: 'r2' })]);
    const { res, statusFn, jsonFn } = createResponse();

    await controller.findAll(res);

    expect(statusFn).toHaveBeenCalledWith(HttpStatus.OK);
    expect(jsonFn.mock.calls[0][0].data).toHaveLength(2);
  });

  it('findOne returns a single rule summary', async () => {
    const { rules, controller } = setup();
    rules.findById.mockResolvedValue(createRule());
    const { res, statusFn, jsonFn } = createResponse();

    await controller.findOne('r1', res);

    expect(rules.findById).toHaveBeenCalledWith('r1');
    expect(statusFn).toHaveBeenCalledWith(HttpStatus.OK);
    expect(jsonFn.mock.calls[0][0].data).toMatchObject({ id: 'r1' });
  });

  it('update forwards the changes and returns the updated summary', async () => {
    const { rules, controller } = setup();
    rules.update.mockResolvedValue(createRule({ priority: 99 }));
    const { res, statusFn, jsonFn } = createResponse();
    const dto: UpdateRoutingRuleDto = { priority: 99 };

    await controller.update('r1', dto, res);

    expect(rules.update).toHaveBeenCalledWith('r1', dto);
    expect(statusFn).toHaveBeenCalledWith(HttpStatus.OK);
    expect(jsonFn.mock.calls[0][0].data.priority).toBe(99);
  });

  it('remove deletes the rule and returns a success message', async () => {
    const { rules, controller } = setup();
    rules.delete.mockResolvedValue(undefined);
    const { res, statusFn, jsonFn } = createResponse();

    await controller.remove('r1', res);

    expect(rules.delete).toHaveBeenCalledWith('r1');
    expect(statusFn).toHaveBeenCalledWith(HttpStatus.OK);
    expect(jsonFn).toHaveBeenCalledWith({ success: true, message: 'Routing rule deleted.', data: null });
  });
});
