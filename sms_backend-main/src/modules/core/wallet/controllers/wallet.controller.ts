import { Body, Controller, Get, Post, Query, UseGuards, Inject, forwardRef, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from '../../../core/auth/guards/api-key.guard';
import { TenantContext } from '../../../core/auth/decorators/tenant-context.decorator';
import { SettlementService } from '../../../core/settlement/services/settlement.service';
import { WalletService } from '../services/wallet.service';
import { TopupService } from '../services/topup.service';
import { InitiateTopupDto } from '../dtos/topup.dto';
import { WALLET_REPOSITORY } from '../interfaces/wallet-repository.interface';
import { LEDGER_SERVICE_PORT, LedgerServicePort } from '../../../core/ledger/interfaces/ledger-service.port';

class ReserveDto {
  @ApiProperty({ example: 100.5 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount!: number;

  @ApiProperty({ example: 'msg-uuid-idempotency-key' })
  @IsString()
  @IsNotEmpty()
  idempotencyKey!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reference?: string;
}

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly topupService: TopupService,
    @Inject(forwardRef(() => SettlementService))
    private readonly settlementService: SettlementService,
    @Inject(LEDGER_SERVICE_PORT)
    private readonly ledgerService: LedgerServicePort,
  ) {}

  @Get('balance')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current wallet balance for tenant' })
  async getBalance(@TenantContext() tenantId: string) {
    return this.walletService.getByTenantId(tenantId);
  }

  @Post('reserve')
  @ApiOperation({ summary: 'Hold funds for a send – idempotent by idempotencyKey (service-to-service)' })
  async reserve(@TenantContext() tenantId: string, @Body() dto: ReserveDto) {
    return this.settlementService.reserve(tenantId, dto.amount, dto.idempotencyKey, dto.reference);
  }

  @Get('transactions')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get wallet transaction ledger' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getTransactions(
    @TenantContext() tenantId: string,
    @Query('limit') limitArg?: number,
    @Query('offset') offsetArg?: number,
  ) {
    const limit = limitArg !== undefined ? Number(limitArg) : 10;
    const offset = offsetArg !== undefined ? Number(offsetArg) : 0;
    const summary = await this.walletService.getByTenantId(tenantId);
    
    const [data, total] = await Promise.all([
      this.ledgerService.findByWalletId(summary.id, limit, offset),
      this.ledgerService.countByWalletId(summary.id),
    ]);

    return {
      data,
      total,
      limit,
      offset,
    };
  }

  @Post('topup/initiate')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Initiate a wallet top-up' })
  async initiateTopup(@TenantContext() tenantId: string, @Body() dto: InitiateTopupDto) {
    return this.topupService.initiateTopup(tenantId, dto);
  }

  @Post('topup/:transactionId/confirm')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Confirm/simulate a wallet top-up (for demo)' })
  async confirmTopup(@Param('transactionId') transactionId: string) {
    return this.topupService.confirmTopup(transactionId);
  }

  @Get('topup/:transactionId')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get top-up transaction status' })
  async getTopupStatus(@Param('transactionId') transactionId: string) {
    const transaction = await this.topupService.getTransaction(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    return transaction;
  }
}
