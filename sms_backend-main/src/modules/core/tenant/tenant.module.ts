import { Module } from '@nestjs/common';
import { TenantController } from './controllers/tenant.controller';
import { TENANT_READER_PORT } from './interfaces/tenant-reader.port';
import { TENANT_REPOSITORY } from './interfaces/tenant-repository.interface';
import { PrismaTenantRepository } from './repositories/prisma-tenant.repository';
import { TenantService } from './services/tenant.service';

@Module({
  controllers: [TenantController],
  providers: [
    TenantService,
    { provide: TENANT_REPOSITORY, useClass: PrismaTenantRepository },
    { provide: TENANT_READER_PORT, useExisting: TenantService },
  ],
  exports: [TENANT_READER_PORT, TenantService],
})
export class TenantModule {}
