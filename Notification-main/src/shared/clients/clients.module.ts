import { Module } from '@nestjs/common';
import { AdaptersClient } from './adapters.client';

@Module({
  providers: [AdaptersClient],
  exports: [AdaptersClient],
})
export class ClientsModule {}
