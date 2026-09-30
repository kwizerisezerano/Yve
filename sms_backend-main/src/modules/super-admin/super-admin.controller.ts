import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { JwtAuthGuard } from '../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../core/auth/guards/roles.guard';
import { Roles } from '../core/auth/decorators/roles.decorator';
import { UserRole, UserStatus } from '../core/user/entities/user.entity';
import { TenantStatus } from '../core/tenant/entities/tenant.entity';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { SettingsService } from '../core/settings/settings.service';

class UpdateTenantStatusDto {
  @ApiProperty({ enum: TenantStatus })
  @IsEnum(TenantStatus)
  status!: TenantStatus;
}

class CreditTenantWalletDto {
  @ApiProperty({ example: 50000, description: 'Amount to credit to wallet' })
  @IsNumber()
  @Min(1)
  amount!: number;

  @ApiProperty({ example: 'Manual admin top-up', description: 'Reason or reference note' })
  @IsString()
  @IsOptional()
  reason?: string;
}

class UpdateUserStatusDto {
  @ApiProperty({ enum: UserStatus })
  @IsEnum(UserStatus)
  status!: UserStatus;
}

class CreateProviderDto {
  @ApiProperty({ example: 'MTN Gateway' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'MTN_RW' })
  @IsString()
  code!: string;

  @ApiProperty({ example: true })
  isActive?: boolean;
}

class UpdateProviderDto {
  @ApiProperty({ example: true })
  isActive?: boolean;
}

class CreatePricingDto {
  @ApiProperty({ example: 'RW', description: 'Country code or name' })
  @IsString()
  country!: string;

  @ApiProperty({ example: 'MTN' })
  @IsString()
  operator!: string;

  @ApiProperty({ example: 12.5 })
  @IsNumber()
  customerPrice!: number;

  @ApiProperty({ example: 8.0 })
  @IsNumber()
  providerCost!: number;

  @ApiProperty({ example: 'RWF' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: 'tenant-id', required: false })
  @IsString()
  @IsOptional()
  tenantId?: string;
}

class UpdateSmsPriceDto {
  @ApiProperty({ example: 15, description: 'SMS price in RWF' })
  @IsNumber()
  @Min(1)
  smsPrice!: number;
}

@ApiTags('super-admin')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('super-admin')
export class SuperAdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
  ) {}

  // ── System stats ─────────────────────────────────────────────────────────

  @Get('stats')
  @ApiOperation({ summary: '[SUPER_ADMIN] System-wide statistics' })
  async getStats() {
    const [tenantCount, userCount, walletAgg, senderIdCount, apiKeyCount] =
      await Promise.all([
        this.prisma.tenant.count(),
        this.prisma.user.count(),
        this.prisma.wallet.aggregate({ _sum: { balance: true } }),
        this.prisma.senderID.count(),
        this.prisma.apiKey.count({ where: { status: 'ACTIVE' } }),
      ]);

    return {
      tenants: tenantCount,
      users: userCount,
      totalWalletBalance: walletAgg._sum.balance ?? 0,
      senderIds: senderIdCount,
      activeApiKeys: apiKeyCount,
    };
  }

  // ── Tenants ──────────────────────────────────────────────────────────────

  @Get('tenants')
  @ApiOperation({ summary: '[SUPER_ADMIN] List all tenants' })
  async listTenants() {
    const tenants = await this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { users: true, apps: true, senderIds: true } },
        wallet: { select: { id: true, balance: true, currency: true } },
      },
    });
    return tenants.map((t) => ({
      id: t.id,
      name: t.name,
      status: t.status,
      createdAt: t.createdAt,
      userCount: t._count.users,
      apiKeyCount: t._count.apps, // Using apps count as proxy for API keys
      senderIdCount: t._count.senderIds,
      walletId: t.wallet?.id,
      walletBalance: t.wallet?.balance ?? 0,
      walletCurrency: t.wallet?.currency ?? 'RWF',
    }));
  }

  @Patch('tenants/:id/status')
  @ApiOperation({ summary: '[SUPER_ADMIN] Update tenant status' })
  async updateTenantStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTenantStatusDto,
  ) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException(`Tenant ${id} not found`);
    if (tenant.status === 'CLOSED') {
      throw new BadRequestException('Cannot change status of a closed tenant');
    }
    const updated = await this.prisma.tenant.update({
      where: { id },
      data: { status: dto.status },
    });
    return { id: updated.id, name: updated.name, status: updated.status };
  }

  @Post('tenants/:id/credit')
  @ApiOperation({ summary: '[SUPER_ADMIN] Credit tenant wallet balance' })
  async creditTenantWallet(
    @Param('id') id: string,
    @Body() dto: CreditTenantWalletDto,
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: { wallet: true },
    });
    if (!tenant) throw new NotFoundException(`Tenant ${id} not found`);

    let wallet = tenant.wallet;
    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: {
          tenantId: id,
          balance: 0,
          currency: 'RWF',
        },
      });
    }

    const currentBalance = Number(wallet.balance);
    const newBalance = currentBalance + dto.amount;

    const [updatedWallet] = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance, version: { increment: 1 } },
      }),
      this.prisma.ledgerEntry.create({
        data: {
          walletId: wallet.id,
          type: 'CREDIT',
          amount: dto.amount,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          reference: `ADMIN_TOPUP_${Date.now()}`,
          description: dto.reason ?? 'Platform Super Admin Top Up',
        },
      }),
    ]);

    return {
      tenantId: id,
      tenantName: tenant.name,
      previousBalance: currentBalance,
      newBalance: Number(updatedWallet.balance),
      currency: updatedWallet.currency,
    };
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  @Get('users')
  @ApiOperation({ summary: '[SUPER_ADMIN] List all users across all tenants' })
  async listAllUsers() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { tenant: { select: { name: true } } },
    });
    return users.map((u) => ({
      id: u.id,
      tenantId: u.tenantId,
      tenantName: u.tenant.name,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
    }));
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: '[SUPER_ADMIN] Change user status (Lock / Activate)' })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: dto.status },
    });
    return { id: updated.id, email: updated.email, status: updated.status };
  }

  // ── Providers ─────────────────────────────────────────────────────────────

  @Get('providers')
  @ApiOperation({ summary: '[SUPER_ADMIN] List all providers' })
  async listProviders() {
    return this.prisma.provider.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post('providers')
  @ApiOperation({ summary: '[SUPER_ADMIN] Create new upstream provider' })
  async createProvider(@Body() dto: CreateProviderDto) {
    const existing = await this.prisma.provider.findUnique({ where: { code: dto.code } });
    if (existing) throw new BadRequestException(`Provider with code ${dto.code} already exists`);

    return this.prisma.provider.create({
      data: {
        name: dto.name,
        code: dto.code,
        isActive: dto.isActive ?? true,
      },
    });
  }

  @Patch('providers/:id')
  @ApiOperation({ summary: '[SUPER_ADMIN] Update provider' })
  async updateProvider(@Param('id') id: string, @Body() dto: UpdateProviderDto) {
    const provider = await this.prisma.provider.findUnique({ where: { id } });
    if (!provider) throw new NotFoundException(`Provider ${id} not found`);

    return this.prisma.provider.update({
      where: { id },
      data: { isActive: dto.isActive },
    });
  }

  // ── Pricing ───────────────────────────────────────────────────────────────

  @Get('pricing')
  @ApiOperation({ summary: '[SUPER_ADMIN] List pricing rules' })
  async listPricing() {
    const records = await this.prisma.pricing.findMany({
      orderBy: { createdAt: 'desc' },
      include: { tenant: { select: { name: true } } },
    });
    return records.map((p) => ({
      id: p.id,
      tenantId: p.tenantId,
      tenantName: p.tenant?.name ?? 'Global Default',
      country: p.country,
      operator: p.operator,
      customerPrice: Number(p.customerPrice),
      providerCost: Number(p.providerCost),
      currency: p.currency,
      createdAt: p.createdAt,
    }));
  }

  @Post('pricing')
  @ApiOperation({ summary: '[SUPER_ADMIN] Create or update pricing rule' })
  async createPricing(@Body() dto: CreatePricingDto) {
    const tenantId = dto.tenantId || null;
    const existing = await this.prisma.pricing.findFirst({
      where: { tenantId, country: dto.country, operator: dto.operator },
    });

    if (existing) {
      return this.prisma.pricing.update({
        where: { id: existing.id },
        data: {
          customerPrice: dto.customerPrice,
          providerCost: dto.providerCost,
          currency: dto.currency ?? 'RWF',
        },
      });
    }

    return this.prisma.pricing.create({
      data: {
        tenantId,
        country: dto.country,
        operator: dto.operator,
        customerPrice: dto.customerPrice,
        providerCost: dto.providerCost,
        currency: dto.currency ?? 'RWF',
      },
    });
  }

  // ── Audit Logs ─────────────────────────────────────────────────────────────

  @Get('audit-logs')
  @ApiOperation({ summary: '[SUPER_ADMIN] List system-wide audit logs' })
  async listAuditLogs() {
    const logs = await this.prisma.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: { select: { name: true } },
        user: { select: { email: true } },
      },
    });
    return logs.map((l) => ({
      id: l.id,
      tenantId: l.tenantId,
      tenantName: l.tenant.name,
      userEmail: l.user?.email ?? 'System / Anonymous',
      action: l.action,
      resource: l.resource,
      resourceId: l.resourceId,
      metadata: l.metadata,
      createdAt: l.createdAt,
    }));
  }

  // ── Sender IDs Approval ──────────────────────────────────────────────────

  @Get('sender-ids')
  @ApiOperation({ summary: '[SUPER_ADMIN] List all sender IDs across all tenants' })
  async listSenderIds() {
    const senderIds = await this.prisma.senderID.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: { select: { name: true } },
      },
    });
    return senderIds.map((s) => ({
      id: s.id,
      tenantId: s.tenantId,
      tenantName: s.tenant.name,
      name: s.name,
      status: s.status,
      approvedAt: s.approvedAt,
      rejectedAt: s.rejectedAt,
      createdAt: s.createdAt,
    }));
  }

  @Patch('sender-ids/:id/approve')
  @ApiOperation({ summary: '[SUPER_ADMIN] Approve a sender ID' })
  async approveSenderId(@Param('id') id: string) {
    const item = await this.prisma.senderID.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Sender ID ${id} not found`);
    return this.prisma.senderID.update({
      where: { id },
      data: { status: 'APPROVED', approvedAt: new Date() },
    });
  }

  @Patch('sender-ids/:id/reject')
  @ApiOperation({ summary: '[SUPER_ADMIN] Reject a sender ID' })
  async rejectSenderId(@Param('id') id: string) {
    const item = await this.prisma.senderID.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Sender ID ${id} not found`);
    return this.prisma.senderID.update({
      where: { id },
      data: { status: 'REJECTED', rejectedAt: new Date() },
    });
  }

  // ── System Settings (SMS Price) ────────────────────────────────────────────

  @Get('settings/sms-price')
  @ApiOperation({ summary: '[SUPER_ADMIN] Get current SMS price' })
  async getSmsPrice() {
    const price = await this.settingsService.getSmsPrice();
    return { smsPrice: price, currency: 'RWF' };
  }

  @Post('settings/sms-price')
  @ApiOperation({ summary: '[SUPER_ADMIN] Update SMS price' })
  async updateSmsPrice(@Body() dto: UpdateSmsPriceDto) {
    await this.settingsService.setSmsPrice(dto.smsPrice);
    return {
      message: 'SMS price updated successfully',
      smsPrice: dto.smsPrice,
      currency: 'RWF',
    };
  }
}
