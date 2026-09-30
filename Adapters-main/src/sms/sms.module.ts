import { Module } from '@nestjs/common';
import { CoreCallbackService } from './core-callback.service';
import { ApiKeyGuard } from './guards/api-key.guard';
import { OpcoCallbackController } from './opco-callback.controller';
import { OpcoClientService } from './opco-client.service';
import { SmsController } from './sms.controller';
import { SmsService } from './sms.service';

@Module({
  controllers: [SmsController, OpcoCallbackController],
  providers: [SmsService, OpcoClientService, CoreCallbackService, ApiKeyGuard],
})
export class SmsModule {}
