import { Module, forwardRef } from '@nestjs/common';
import { API_KEY_REPOSITORY } from './interfaces/api-key-repository.interface';
import { PrismaApiKeyRepository } from './repositories/prisma-api-key.repository';
import { ApiKeyService } from './services/api-key.service';
import { ApiKeyController } from './controllers/api-key.controller';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { RedisModule } from '../../../shared/redis/redis.module';
import { EncryptionModule } from '../../../shared/encryption/encryption.module';
import { AppModule } from '../app/app.module';

@Module({
  imports: [PrismaModule, RedisModule, EncryptionModule, forwardRef(() => AppModule)],
  controllers: [ApiKeyController],
  providers: [
    ApiKeyService,
    { provide: API_KEY_REPOSITORY, useClass: PrismaApiKeyRepository },
  ],
  exports: [ApiKeyService, API_KEY_REPOSITORY],
})
export class ApiKeyModule {}
