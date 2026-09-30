import { Module } from '@nestjs/common';
import { UsageController } from './controllers/usage.controller';
import { UsageService } from './services/usage.service';

@Module({
  controllers: [UsageController],
  providers: [UsageService],
  exports: [UsageService],
})
export class UsageModule {}
