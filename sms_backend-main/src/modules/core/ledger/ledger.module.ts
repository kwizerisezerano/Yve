import { Module } from '@nestjs/common';
import { LEDGER_SERVICE_PORT } from './interfaces/ledger-service.port';
import { LEDGER_REPOSITORY } from './interfaces/ledger-repository.interface';
import { LedgerService } from './services/ledger.service';
import { PrismaLedgerRepository } from './repositories/prisma-ledger.repository';

@Module({
  providers: [
    LedgerService,
    { provide: LEDGER_REPOSITORY, useClass: PrismaLedgerRepository },
    { provide: LEDGER_SERVICE_PORT, useExisting: LedgerService },
  ],
  exports: [LEDGER_SERVICE_PORT],
})
export class LedgerModule {}
