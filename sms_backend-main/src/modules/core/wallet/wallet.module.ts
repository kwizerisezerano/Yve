import { Module } from '@nestjs/common';
import { WalletController } from './controllers/wallet.controller';
import { WalletService } from './services/wallet.service';
import { TopupService } from './services/topup.service';
import { WALLET_REPOSITORY } from './interfaces/wallet-repository.interface';
import { WALLET_READER_PORT } from './interfaces/wallet-reader.port';
import { PrismaWalletRepository } from './repositories/prisma-wallet.repository';
import { LedgerModule } from '../ledger/ledger.module';
import { SettlementModule } from '../settlement/settlement.module';
import { AuditModule } from '../audit/audit.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [LedgerModule, forwardRef(() => SettlementModule), AuditModule],
  controllers: [WalletController],
  providers: [
    WalletService,
    TopupService,
    { provide: WALLET_REPOSITORY, useClass: PrismaWalletRepository },
    { provide: WALLET_READER_PORT, useExisting: WalletService },
  ],
  exports: [WalletService, WALLET_REPOSITORY, WALLET_READER_PORT],
})
export class WalletModule {}
