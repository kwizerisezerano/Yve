import { Module } from '@nestjs/common';
import { ProviderController } from './controllers/provider.controller';
import { PROVIDER_REPOSITORY } from './interfaces/provider.repository.interface';
import { PrismaProviderRepository } from './repositories/provider.repository';
import { ProviderService } from './services/provider.service';

@Module({
  controllers: [ProviderController],
  providers: [{ provide: PROVIDER_REPOSITORY, useClass: PrismaProviderRepository }, ProviderService],
  exports: [ProviderService],
})
export class ProviderModule {}
