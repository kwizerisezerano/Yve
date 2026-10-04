import { Inject, Injectable } from '@nestjs/common';
import { LedgerEntry } from '../entities/ledger-entry.entity';
import { LEDGER_REPOSITORY, LedgerRepository } from '../interfaces/ledger-repository.interface';
import { LedgerEntryView, LedgerServicePort, WalletMovementType } from '../interfaces/ledger-service.port';

@Injectable()
export class LedgerService implements LedgerServicePort {
  constructor(@Inject(LEDGER_REPOSITORY) private readonly ledgerRepository: LedgerRepository) {}

  async record(
    walletId: string,
    type: WalletMovementType,
    amount: number,
    balanceBefore: number,
    balanceAfter: number,
    reference: string,
    description?: string,
    serviceType?: 'SMS' | 'EMAIL',
  ): Promise<void> {
    const entry = LedgerEntry.create(walletId, type, amount, balanceBefore, balanceAfter, reference, description, serviceType);
    await this.ledgerRepository.insert(entry);
  }

  async findByWalletId(walletId: string, limit = 50, offset = 0): Promise<LedgerEntryView[]> {
    const entries = await this.ledgerRepository.findByWalletId(walletId, limit, offset);
    return entries.map((e) => ({
      id: e.id,
      walletId: e.walletId,
      type: e.type,
      amount: e.amount,
      balanceBefore: e.balanceBefore,
      balanceAfter: e.balanceAfter,
      reference: e.reference,
      description: e.description,
      serviceType: e.serviceType,
      createdAt: e.createdAt,
    }));
  }

  async countByWalletId(walletId: string): Promise<number> {
    return this.ledgerRepository.countByWalletId(walletId);
  }
}
