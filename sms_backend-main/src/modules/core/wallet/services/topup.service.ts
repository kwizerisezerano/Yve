import { Injectable, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { WalletService } from './wallet.service';
import { AuditService, AuditAction } from '../../audit/services/audit.service';
import { InitiateTopupDto, PaymentMethod, TopupTransaction } from '../dtos/topup.dto';

@Injectable()
export class TopupService {
  // In-memory store for demo purposes - in production, use database
  private transactions = new Map<string, TopupTransaction>();

  constructor(
    private readonly walletService: WalletService,
    private readonly auditService: AuditService,
  ) {}

  async initiateTopup(tenantId: string, dto: InitiateTopupDto): Promise<{ transactionId: string; paymentUrl?: string }> {
    // Validate amount
    if (dto.amount < 1000) {
      throw new BadRequestException('Minimum top-up amount is RWF 1,000');
    }
    if (dto.amount > 10000000) {
      throw new BadRequestException('Maximum top-up amount is RWF 10,000,000');
    }

    // Validate phone number for MOMO
    if (dto.paymentMethod === PaymentMethod.MOMO && !dto.phoneNumber) {
      throw new BadRequestException('Phone number is required for Mobile Money');
    }

    // Create transaction
    const transactionId = randomUUID();
    const reference = `TOPUP-${Date.now()}-${transactionId.substring(0, 8)}`;

    const transaction: TopupTransaction = {
      id: transactionId,
      tenantId,
      amount: dto.amount,
      currency: 'RWF',
      paymentMethod: dto.paymentMethod,
      status: 'PENDING',
      phoneNumber: dto.phoneNumber,
      reference,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.transactions.set(transactionId, transaction);

    // Simulate payment gateway
    await this.auditService.log(
      tenantId,
      AuditAction.WALLET_TOPUP_INITIATED,
      'topup',
      transactionId,
      { amount: dto.amount, paymentMethod: dto.paymentMethod },
    );

    // In real implementation, this would redirect to payment gateway
    const paymentUrl = this.getSimulatedPaymentUrl(transactionId, dto.paymentMethod);

    return {
      transactionId,
      paymentUrl,
    };
  }

  async confirmTopup(transactionId: string): Promise<TopupTransaction> {
    const transaction = this.transactions.get(transactionId);
    
    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    if (transaction.status !== 'PENDING') {
      throw new BadRequestException(`Transaction already ${transaction.status}`);
    }

    // Simulate payment confirmation (90% success rate for demo)
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      // Credit the wallet
      await this.walletService.credit(
        transaction.tenantId,
        transaction.amount,
        transaction.reference,
      );

      transaction.status = 'SUCCESS';
      transaction.updatedAt = new Date();

      await this.auditService.log(
        transaction.tenantId,
        AuditAction.WALLET_TOPUP_COMPLETED,
        'topup',
        transactionId,
        { amount: transaction.amount, reference: transaction.reference },
      );
    } else {
      transaction.status = 'FAILED';
      transaction.updatedAt = new Date();

      await this.auditService.log(
        transaction.tenantId,
        AuditAction.WALLET_TOPUP_FAILED,
        'topup',
        transactionId,
        { amount: transaction.amount, reason: 'Payment declined' },
      );
    }

    this.transactions.set(transactionId, transaction);
    return transaction;
  }

  async getTransaction(transactionId: string): Promise<TopupTransaction | null> {
    return this.transactions.get(transactionId) || null;
  }

  private getSimulatedPaymentUrl(transactionId: string, method: PaymentMethod): string {
    // In production, this would be actual payment gateway URLs
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    return `${baseUrl}/api/simulate-payment?txn=${transactionId}&method=${method}`;
  }
}
