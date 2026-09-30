import { Injectable } from '@nestjs/common';
import { TenantService } from '../../tenant/services/tenant.service';
import { UserService } from '../../user/services/user.service';
import { UserRole } from '../../user/entities/user.entity';
import { WalletService } from '../../wallet/services/wallet.service';
import { SenderIdService } from '../../sender-id/services/sender-id.service';
import { AuditService, AuditAction } from '../../audit/services/audit.service';

@Injectable()
export class OnboardingService {
  constructor(
    private readonly tenantService: TenantService,
    private readonly userService: UserService,
    private readonly walletService: WalletService,
    private readonly senderIdService: SenderIdService,
    private readonly auditService: AuditService,
  ) {}

  async onboard(tenantName: string, adminEmail: string, adminPassword: string, senderName?: string) {
    // Step 1: Create tenant
    const tenant = await this.tenantService.create(tenantName);

    // Step 2: Create admin user
    const user = await this.userService.create(tenant.id, adminEmail, adminPassword, UserRole.ADMIN);

    // Step 3: Create wallet
    const wallet = await this.walletService.createForTenant(tenant.id);

    // Step 4: Register initial sender ID (optional)
    let senderId = null;
    if (senderName) {
      senderId = await this.senderIdService.register(tenant.id, senderName);
    }

    // Step 5: Audit
    await this.auditService.log(
      tenant.id,
      AuditAction.ONBOARDING_COMPLETED,
      'tenant',
      tenant.id,
      { adminEmail, senderName: senderName || null },
      user.id,
    );

    return {
      tenant: { id: tenant.id, name: tenant.name, status: tenant.status },
      user: { id: user.id, email: user.email, role: user.role },
      wallet: { id: wallet.id, balance: wallet.balance, currency: wallet.currency },
      ...(senderId && { senderId: { id: senderId.id, name: senderId.name, status: senderId.status } }),
    };
  }
}
