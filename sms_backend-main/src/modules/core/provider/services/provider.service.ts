import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/common/exceptions/entity-not-found.exception';
import { Provider, ProviderCapabilities } from '../entities/provider.entity';
import { PROVIDER_REPOSITORY, ProviderRepository } from '../interfaces/provider-repository.interface';

@Injectable()
export class ProviderService {
  constructor(@Inject(PROVIDER_REPOSITORY) private readonly providerRepository: ProviderRepository) {}

  async create(name: string, code: string, capabilities: ProviderCapabilities, metadata: Record<string, unknown> = {}): Promise<Provider> {
    const provider = Provider.create(name, code, capabilities, metadata);
    return this.providerRepository.create(provider);
  }

  async list(): Promise<Provider[]> { return this.providerRepository.findAll(); }
  async listActive(): Promise<Provider[]> { return this.providerRepository.findActive(); }

  async getByCode(code: string): Promise<Provider> {
    const p = await this.providerRepository.findByCode(code);
    if (!p) throw new EntityNotFoundException('Provider', code);
    return p;
  }

  async deactivate(id: string): Promise<Provider> {
    const p = await this.providerRepository.findById(id);
    if (!p) throw new EntityNotFoundException('Provider', id);
    p.deactivate();
    return this.providerRepository.save(p);
  }
}
