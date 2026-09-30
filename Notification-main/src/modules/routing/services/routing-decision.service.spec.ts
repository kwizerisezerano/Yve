import { RoutingDecisionStatus } from '../entities/routing-decision.entity';
import type { RoutingDecisionRepository } from '../interfaces/routing-decision.repository.interface';
import { RoutingDecisionService } from './routing-decision.service';

function setup() {
  const repository: jest.Mocked<RoutingDecisionRepository> = {
    create: jest.fn(),
    findByMessageId: jest.fn(),
  };
  const service = new RoutingDecisionService(repository);
  return { repository, service };
}

describe('RoutingDecisionService', () => {
  it('record persists a decision built from the given input', async () => {
    const { repository, service } = setup();
    repository.create.mockImplementation((decision) => Promise.resolve(decision));

    const result = await service.record({
      messageId: 'm1',
      provider: 'provider-a',
      status: RoutingDecisionStatus.SELECTED,
      reason: null,
      cost: 0.02,
      health: 'healthy',
    });

    expect(repository.create).toHaveBeenCalledTimes(1);
    const persisted = repository.create.mock.calls[0][0];
    expect(persisted.messageId).toBe('m1');
    expect(persisted.status).toBe(RoutingDecisionStatus.SELECTED);
    expect(result.provider).toBe('provider-a');
  });

  it('findByMessageId delegates to the repository', async () => {
    const { repository, service } = setup();
    repository.findByMessageId.mockResolvedValue([]);

    await service.findByMessageId('m1');

    expect(repository.findByMessageId).toHaveBeenCalledWith('m1');
  });
});
