import { randomUUID } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { NotFoundDomainException } from '../../../shared/common/exceptions/not-found.exception';
import { Provider, ProviderStatus } from '../entities/provider.entity';
import {
  PROVIDER_REPOSITORY,
  type ProviderRepository,
} from '../interfaces/provider.repository.interface';

export interface CreateProviderInput {
  name: string;
  description?: string | null;
  defaultCost?: number | null;
}

export interface UpdateProviderInput {
  name?: string;
  description?: string | null;
  defaultCost?: number | null;
  status?: ProviderStatus;
}

@Injectable()
export class ProviderService {
  constructor(@Inject(PROVIDER_REPOSITORY) private readonly repository: ProviderRepository) {}

  create(input: CreateProviderInput): Promise<Provider> {
    const provider = Provider.create({
      id: randomUUID(),
      name: input.name,
      description: input.description ?? null,
      defaultCost: input.defaultCost ?? null,
      createdAt: new Date(),
    });
    return this.repository.create(provider);
  }

  findAll(): Promise<Provider[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<Provider> {
    const provider = await this.repository.findById(id);
    if (!provider) {
      throw new NotFoundDomainException(`Provider ${id} not found.`);
    }
    return provider;
  }

  findByIds(ids: string[]): Promise<Provider[]> {
    return this.repository.findByIds(ids);
  }

  async update(id: string, changes: UpdateProviderInput): Promise<Provider> {
    const provider = await this.findById(id);
    return this.repository.update(provider.withUpdates(changes));
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }
}
