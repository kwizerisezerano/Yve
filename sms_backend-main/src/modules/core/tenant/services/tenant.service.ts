import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/common/exceptions/entity-not-found.exception';
import { Tenant } from '../entities/tenant.entity';
import { TENANT_REPOSITORY, TenantRepository } from '../interfaces/tenant-repository.interface';
import { TenantReaderPort, TenantSummary } from '../interfaces/tenant-reader.port';

@Injectable()
export class TenantService implements TenantReaderPort {
  constructor(@Inject(TENANT_REPOSITORY) private readonly tenantRepository: TenantRepository) {}

  async create(name: string): Promise<Tenant> {
    const tenant = Tenant.create(name);
    return this.tenantRepository.create(tenant);
  }

  async getById(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) {
      throw new EntityNotFoundException('Tenant', id);
    }
    return tenant;
  }

  async list(): Promise<Tenant[]> {
    return this.tenantRepository.findAll();
  }

  async update(id: string, name: string): Promise<Tenant> {
    const tenant = await this.getById(id);
    tenant.rename(name);
    return this.tenantRepository.save(tenant);
  }

  async suspend(id: string): Promise<Tenant> {
    const tenant = await this.getById(id);
    tenant.suspend();
    return this.tenantRepository.save(tenant);
  }

  async close(id: string): Promise<Tenant> {
    const tenant = await this.getById(id);
    tenant.close();
    return this.tenantRepository.save(tenant);
  }

  async findById(id: string): Promise<TenantSummary | null> {
    const tenant = await this.tenantRepository.findById(id);
    return tenant ? { id: tenant.id, name: tenant.name, status: tenant.status } : null;
  }

  async isActive(id: string): Promise<boolean> {
    const tenant = await this.tenantRepository.findById(id);
    return tenant !== null && tenant.isActive;
  }
}
