import { Module } from '@nestjs/common';
import { MessageModule } from '../message/message.module';
import { RetryPolicyService } from './services/retry-policy.service';
import { RetryService } from './services/retry.service';

@Module({
  imports: [MessageModule],
  providers: [RetryPolicyService, RetryService],
  exports: [RetryService],
})
export class RetryModule {}
