import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MessageController } from './controllers/message.controller';
import { MESSAGE_ATTEMPT_REPOSITORY } from './interfaces/message-attempt.repository.interface';
import { MESSAGE_REPOSITORY } from './interfaces/message.repository.interface';
import { PrismaMessageAttemptRepository } from './repositories/message-attempt.repository';
import { PrismaMessageRepository } from './repositories/message.repository';
import { MessageAttemptService } from './services/message-attempt.service';
import { MessageIntakeService } from './services/message-intake.service';
import { MessageLifecycleService } from './services/message-lifecycle.service';
import { MessageService } from './services/message.service';

@Module({
  imports: [AuthModule],
  controllers: [MessageController],
  providers: [
    { provide: MESSAGE_REPOSITORY, useClass: PrismaMessageRepository },
    { provide: MESSAGE_ATTEMPT_REPOSITORY, useClass: PrismaMessageAttemptRepository },
    MessageService,
    MessageLifecycleService,
    MessageAttemptService,
    MessageIntakeService,
  ],
  exports: [MessageService, MessageLifecycleService, MessageAttemptService],
})
export class MessageModule {}
