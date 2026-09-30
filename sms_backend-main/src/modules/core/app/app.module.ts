import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { PrismaAppRepository } from './repositories/prisma-app.repository';
import { APP_REPOSITORY } from './interfaces/app-repository.interface';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { MessagingModule } from '../messaging/messaging.module';

@Module({
  imports: [PrismaModule, AuditModule, MessagingModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_REPOSITORY,
      useClass: PrismaAppRepository,
    },
  ],
  exports: [AppService, APP_REPOSITORY],
})
export class AppModule {}
