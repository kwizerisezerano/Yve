import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import type { LedgerEntry as LedgerEntryRecord } from '@prisma/client';
import { LedgerEntry } from '../entities/ledger-entry.entity';
import { LedgerRepository } from '../interfaces/ledger-repository.interface';
import { WalletMovementType } from '../interfaces/ledger-service.port';

@Injectable()
export class PrismaLedgerRepository implements LedgerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async insert(entry: LedgerEntry): Promise<LedgerEntry> {
    const record = await this.prisma.ledgerEntry.create({
      data: {
        id: entry.id,
        walletId: entry.walletId,
        type: entry.type,
        serviceType: entry.serviceType ?? 'SMS',
        amount: entry.amount,
        balanceBefore: entry.balanceBefore,
        balanceAfter: entry.balanceAfter,
        reference: entry.reference,
        description: entry.description,
      },
    });
    return this.toDomain(record);
  }

  async findByWalletId(walletId: string, limit = 50, offset = 0): Promise<LedgerEntry[]> {
    const records = await this.prisma.ledgerEntry.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    return records.map((r) => this.toDomain(r));
  }

  async countByWalletId(walletId: string): Promise<number> {
    return this.prisma.ledgerEntry.count({
      where: { walletId },
    });
  }

  private toDomain(record: LedgerEntryRecord): LedgerEntry {
    return LedgerEntry.restore({
      id: record.id,
      walletId: record.walletId,
      type: record.type as WalletMovementType,
      serviceType: record.serviceType as 'SMS' | 'EMAIL',
      amount: Number(record.amount),
      balanceBefore: Number(record.balanceBefore),
      balanceAfter: Number(record.balanceAfter),
      reference: record.reference,
      description: record.description ?? undefined,
      createdAt: record.createdAt,
    });
  }
}
