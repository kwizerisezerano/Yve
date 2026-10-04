import { Module } from '@nestjs/common';
import { TenantModule } from './tenant/tenant.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AppModule } from './app/app.module';
import { ApiKeyModule } from './api-key/api-key.module';
import { SenderIdModule } from './sender-id/sender-id.module';
import { PricingModule } from './pricing/pricing.module';
import { ProviderModule } from './provider/provider.module';
import { WalletModule } from './wallet/wallet.module';
import { LedgerModule } from './ledger/ledger.module';
import { SettlementModule } from './settlement/settlement.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { IntelligenceModule } from './intelligence/intelligence.module';
import { AuditModule } from './audit/audit.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { UsageModule } from './usage/usage.module';
import { SettingsModule } from './settings/settings.module';
import { MessagingModule } from './messaging/messaging.module';
import { EmailModule } from './email/email.module';
import { SuperAdminModule } from '../super-admin/super-admin.module';

@Module({
  imports: [
    TenantModule,
    UserModule,
    AuthModule,
    AppModule,
    ApiKeyModule,
    SenderIdModule,
    PricingModule,
    ProviderModule,
    WalletModule,
    LedgerModule,
    SettlementModule,
    TelemetryModule,
    IntelligenceModule,
    AuditModule,
    OnboardingModule,
    UsageModule,
    SettingsModule,
    MessagingModule,
    EmailModule,
    SuperAdminModule,
  ],
})
export class CoreModule {}

