import { Module } from '@nestjs/common';
import { SettlementService } from './services/settlement.service';
import { RESERVATION_REPOSITORY } from './interfaces/reservation-repository.interface';
import { PrismaReservationRepository } from './repositories/prisma-reservation.repository';
import { WalletModule } from '../wallet/wallet.module';
import { LedgerModule } from '../ledger/ledger.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [forwardRef(() => WalletModule), LedgerModule],
  providers: [
    SettlementService,
    { provide: RESERVATION_REPOSITORY, useClass: PrismaReservationRepository },
  ],
  exports: [SettlementService],
})
export class SettlementModule {}
