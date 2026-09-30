import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountsModule } from './accounts/accounts.module';
import { PrismaModule } from './prisma/prisma.module';
import { SmsModule } from './sms/sms.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [PrismaModule, AccountsModule, SmsModule],
})
export class AppModule {}
