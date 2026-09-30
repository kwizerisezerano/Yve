import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

@Injectable()
export class UsageService {
  constructor(private readonly prisma: PrismaService) {}

  async aggregate(tenantId: string, from: Date, to: Date): Promise<{
    tenantId: string;
    from: Date;
    to: Date;
    totalMessages: number;
    totalSpend: number;
    currency: string;
    walletBalance: number;
    ledgerEntries: number;
  }> {
    const wallet = await this.prisma.wallet.findUnique({ where: { tenantId } });

    // Count ledger debits in period as proxy for message spend
    const debits = await this.prisma.ledgerEntry.findMany({
      where: { walletId: wallet?.id, type: 'DEBIT', createdAt: { gte: from, lte: to } },
    });

    const totalSpend = debits.reduce((sum, e) => sum + Number(e.amount), 0);

    return {
      tenantId,
      from,
      to,
      totalMessages: debits.length,
      totalSpend,
      currency: wallet?.currency ?? 'RWF',
      walletBalance: Number(wallet?.balance ?? 0),
      ledgerEntries: debits.length,
    };
  }
}
