import { Module } from '@nestjs/common';
import { SenderIdController } from './controllers/sender-id.controller';
import { SenderIdService } from './services/sender-id.service';
import { SENDER_ID_REPOSITORY } from './interfaces/sender-id-repository.interface';
import { PrismaSenderIdRepository } from './repositories/prisma-sender-id.repository';

@Module({
  controllers: [SenderIdController],
  providers: [
    SenderIdService,
    { provide: SENDER_ID_REPOSITORY, useClass: PrismaSenderIdRepository },
  ],
  exports: [SenderIdService],
})
export class SenderIdModule {}
