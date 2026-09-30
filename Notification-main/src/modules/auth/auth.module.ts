import { Module } from '@nestjs/common';
import { TenantController } from './controllers/tenant.controller';
import { TenantAuthGuard } from './guards/tenant-auth.guard';
import { TENANT_REPOSITORY } from './interfaces/tenant.repository.interface';
import { PrismaTenantRepository } from './repositories/tenant.repository';
import { AuthService } from './services/auth.service';
import { TenantRegistrationService } from './services/tenant-registration.service';
import { TenantService } from './services/tenant.service';

@Module({
  controllers: [TenantController],
  providers: [
    { provide: TENANT_REPOSITORY, useClass: PrismaTenantRepository },
    AuthService,
    TenantRegistrationService,
    TenantService,
    TenantAuthGuard,
  ],
  exports: [AuthService, TenantAuthGuard, TenantService],
})
export class AuthModule {}
