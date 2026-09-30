import { Module } from '@nestjs/common';
import { ProviderController } from './controllers/provider.controller';
import { ProviderService } from './services/provider.service';
import { PROVIDER_REPOSITORY } from './interfaces/provider-repository.interface';
import { PrismaProviderRepository } from './repositories/prisma-provider.repository';

@Module({
  controllers: [ProviderController],
  providers: [ProviderService, { provide: PROVIDER_REPOSITORY, useClass: PrismaProviderRepository }],
  exports: [ProviderService],
})
export class ProviderModule {}
