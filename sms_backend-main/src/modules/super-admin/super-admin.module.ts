import { Module } from '@nestjs/common';
import { SuperAdminController } from './super-admin.controller';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { SettingsModule } from '../core/settings/settings.module';

@Module({
  imports: [PrismaModule, SettingsModule],
  controllers: [SuperAdminController],
})
export class SuperAdminModule {}
