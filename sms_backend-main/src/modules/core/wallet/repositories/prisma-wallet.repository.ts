import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import type { Wallet as WalletRecord } from '@prisma/client';
import { Wallet } from '../entities/wallet.entity';
import { WalletRepository } from '../interfaces/wallet-repository.interface';
import { StateConflictException } from '../../../../shared/common/exceptions/state-conflict.exception';

@Injectable()
export class PrismaWalletRepository implements WalletRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(wallet: Wallet): Promise<Wallet> {
    const record = await this.prisma.wallet.create({
      data: {
        id: wallet.id,
        tenantId: wallet.tenantId,
        smsBalance: wallet.smsBalance,
        emailBalance: wallet.emailBalance,
        reservedBalance: wallet.reservedBalance,
        currency: wallet.currency,
        version: wallet.version,
      },
    });
    return this.toDomain(record);
  }

  async findByTenantId(tenantId: string): Promise<Wallet | null> {
    const record = await this.prisma.wallet.findUnique({ where: { tenantId } });
    return record ? this.toDomain(record) : null;
  }

  async findById(id: string): Promise<Wallet | null> {
    const record = await this.prisma.wallet.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async saveWithVersion(wallet: Wallet, expectedVersion: number): Promise<Wallet> {
    try {
      const record = await this.prisma.wallet.updateMany({
        where: { id: wallet.id, version: expectedVersion },
        data: {
          smsBalance: wallet.smsBalance,
          emailBalance: wallet.emailBalance,
          reservedBalance: wallet.reservedBalance,
          version: expectedVersion + 1,
        },
      });
      if (record.count === 0) {
        throw new StateConflictException('Wallet was modified concurrently. Please retry.');
      }
      const updated = await this.prisma.wallet.findUnique({ where: { id: wallet.id } });
      return this.toDomain(updated!);
    } catch (err) {
      if (err instanceof StateConflictException) throw err;
      throw new StateConflictException('Wallet update failed: ' + String(err));
    }
  }

  private toDomain(record: WalletRecord): Wallet {
    return Wallet.restore({
      id: record.id,
      tenantId: record.tenantId,
      smsBalance: Number(record.smsBalance),
      emailBalance: Number(record.emailBalance),
      reservedBalance: Number(record.reservedBalance),
      currency: record.currency,
      version: record.version,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
