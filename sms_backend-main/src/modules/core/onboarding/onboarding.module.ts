import { Module } from '@nestjs/common';
import { OnboardingController } from './controllers/onboarding.controller';
import { OnboardingService } from './services/onboarding.service';
import { TenantModule } from '../tenant/tenant.module';
import { UserModule } from '../user/user.module';
import { WalletModule } from '../wallet/wallet.module';
import { SenderIdModule } from '../sender-id/sender-id.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TenantModule, UserModule, WalletModule, SenderIdModule, AuditModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
