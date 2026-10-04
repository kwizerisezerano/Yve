import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/common/exceptions/entity-not-found.exception';
import { Wallet } from '../entities/wallet.entity';
import { WALLET_REPOSITORY, WalletRepository } from '../interfaces/wallet-repository.interface';
import { WALLET_READER_PORT, WalletReaderPort, WalletSummary } from '../interfaces/wallet-reader.port';
import { LEDGER_SERVICE_PORT, LedgerServicePort, WalletMovementType } from '../../ledger/interfaces/ledger-service.port';

@Injectable()
export class WalletService implements WalletReaderPort {
  constructor(
    @Inject(WALLET_REPOSITORY) private readonly walletRepository: WalletRepository,
    @Inject(LEDGER_SERVICE_PORT) private readonly ledgerService: LedgerServicePort,
  ) {}

  async createForTenant(tenantId: string, currency = 'RWF'): Promise<Wallet> {
    const existing = await this.walletRepository.findByTenantId(tenantId);
    if (existing) return existing;
    const wallet = Wallet.create(tenantId, currency);
    return this.walletRepository.create(wallet);
  }

  async getByTenantId(tenantId: string): Promise<WalletSummary> {
    const wallet = await this.walletRepository.findByTenantId(tenantId);
    if (!wallet) throw new EntityNotFoundException('Wallet', tenantId);
    return this.toSummary(wallet);
  }

  async credit(tenantId: string, amount: number, reference: string, serviceType: 'SMS' | 'EMAIL' = 'SMS'): Promise<void> {
    const wallet = await this.walletRepository.findByTenantId(tenantId);
    if (!wallet) throw new EntityNotFoundException('Wallet', tenantId);
    const version = wallet.version;
    const before = serviceType === 'SMS' ? wallet.smsBalance : wallet.emailBalance;
    
    if (serviceType === 'SMS') {
      wallet.creditSms(amount);
    } else {
      wallet.creditEmail(amount);
    }
    
    const saved = await this.walletRepository.saveWithVersion(wallet, version);
    await this.ledgerService.record(saved.id, WalletMovementType.CREDIT, amount, before, serviceType === 'SMS' ? saved.smsBalance : saved.emailBalance, reference, serviceType);
  }

  async debit(tenantId: string, amount: number, reference: string, serviceType: 'SMS' | 'EMAIL' = 'SMS'): Promise<void> {
    const wallet = await this.walletRepository.findByTenantId(tenantId);
    if (!wallet) throw new EntityNotFoundException('Wallet', tenantId);
    const version = wallet.version;
    const before = serviceType === 'SMS' ? wallet.smsBalance : wallet.emailBalance;
    
    if (serviceType === 'SMS') {
      wallet.debitSms(amount);
    } else {
      wallet.debitEmail(amount);
    }
    
    const saved = await this.walletRepository.saveWithVersion(wallet, version);
    await this.ledgerService.record(saved.id, WalletMovementType.DEBIT, amount, before, serviceType === 'SMS' ? saved.smsBalance : saved.emailBalance, reference, serviceType);
  }

  async getBalance(tenantId: string): Promise<{ smsBalance: number; emailBalance: number; reservedBalance: number; availableSmsBalance: number; availableEmailBalance: number }> {
    const wallet = await this.walletRepository.findByTenantId(tenantId);
    if (!wallet) throw new EntityNotFoundException('Wallet', tenantId);
    return {
      smsBalance: wallet.smsBalance,
      emailBalance: wallet.emailBalance,
      reservedBalance: wallet.reservedBalance,
      availableSmsBalance: wallet.smsBalance - wallet.reservedBalance,
      availableEmailBalance: wallet.emailBalance - wallet.reservedBalance,
    };
  }

  async getServiceBalance(tenantId: string, serviceType: 'SMS' | 'EMAIL'): Promise<number> {
    const wallet = await this.walletRepository.findByTenantId(tenantId);
    if (!wallet) throw new EntityNotFoundException('Wallet', tenantId);
    return serviceType === 'SMS' ? wallet.smsBalance : wallet.emailBalance;
  }

  async reserve(tenantId: string, amount: number, reference: string, description: string): Promise<void> {
    const wallet = await this.walletRepository.findByTenantId(tenantId);
    if (!wallet) throw new EntityNotFoundException('Wallet', tenantId);
    const version = wallet.version;
    wallet.addReservation(amount);
    await this.walletRepository.saveWithVersion(wallet, version);
    // Note: Using CREDIT type for reservation - ideally add RESERVE to enum
  }

  async settleReservation(tenantId: string, reference: string): Promise<void> {
    // This is a simplified implementation - in production you'd track reservations by reference
    // For now, we'll just debit the amount (reservation logic would be more complex)
    const wallet = await this.walletRepository.findByTenantId(tenantId);
    if (!wallet) throw new EntityNotFoundException('Wallet', tenantId);
    // Note: Real implementation would look up the reservation amount by reference
    // For now, this is a placeholder that needs proper reservation tracking
  }

  async releaseReservation(tenantId: string, reference: string): Promise<void> {
    // This is a simplified implementation - in production you'd track reservations by reference
    const wallet = await this.walletRepository.findByTenantId(tenantId);
    if (!wallet) throw new EntityNotFoundException('Wallet', tenantId);
    // Note: Real implementation would look up the reservation amount by reference and release it
    // For now, this is a placeholder that needs proper reservation tracking
  }

  // WalletReaderPort implementation
  async getByTenantIdPort(tenantId: string): Promise<WalletSummary | null> {
    const wallet = await this.walletRepository.findByTenantId(tenantId);
    return wallet ? this.toSummary(wallet) : null;
  }

  private toSummary(wallet: Wallet): WalletSummary {
    return {
      id: wallet.id,
      tenantId: wallet.tenantId,
      balance: wallet.smsBalance + wallet.emailBalance, // Total balance
      reservedBalance: wallet.reservedBalance,
      availableBalance: (wallet.smsBalance + wallet.emailBalance) - wallet.reservedBalance,
      currency: wallet.currency,
    };
  }
}
