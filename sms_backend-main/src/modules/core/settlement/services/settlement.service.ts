import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { EntityNotFoundException } from '../../../../shared/common/exceptions/entity-not-found.exception';
import { WALLET_REPOSITORY, WalletRepository } from '../../../core/wallet/interfaces/wallet-repository.interface';
import { LEDGER_SERVICE_PORT, LedgerServicePort, WalletMovementType } from '../../../core/ledger/interfaces/ledger-service.port';
import { RESERVATION_REPOSITORY, ReservationRepository, ReservationStatus } from '../interfaces/reservation-repository.interface';

export interface ReserveResult {
  reservationId: string;
  idempotencyKey: string;
  amount: number;
  status: ReservationStatus;
  walletId: string;
}

@Injectable()
export class SettlementService {
  constructor(
    @Inject(WALLET_REPOSITORY) private readonly walletRepository: WalletRepository,
    @Inject(LEDGER_SERVICE_PORT) private readonly ledgerService: LedgerServicePort,
    @Inject(RESERVATION_REPOSITORY) private readonly reservationRepository: ReservationRepository,
  ) {}

  /**
   * Reserve funds for a send.
   * Idempotent: if the same idempotencyKey is presented again, the existing
   * reservation is returned without any new wallet mutation.
   */
  async reserve(tenantId: string, amount: number, idempotencyKey: string, reference?: string): Promise<ReserveResult> {
    // ── Idempotency check ──────────────────────────────────────────────────
    const existing = await this.reservationRepository.findByIdempotencyKey(idempotencyKey);
    if (existing) {
      return {
        reservationId: existing.id,
        idempotencyKey: existing.idempotencyKey,
        amount: existing.amount,
        status: existing.status,
        walletId: existing.walletId,
      };
    }

    // ── Load and lock wallet ───────────────────────────────────────────────
    const wallet = await this.walletRepository.findByTenantId(tenantId);
    if (!wallet) throw new EntityNotFoundException('Wallet', tenantId);
    const version = wallet.version;
    const before = wallet.balance;

    wallet.addReservation(amount); // throws if insufficient
    const saved = await this.walletRepository.saveWithVersion(wallet, version);

    // ── Record ledger entry ────────────────────────────────────────────────
    await this.ledgerService.record(
      saved.id, WalletMovementType.RESERVE, amount, before, saved.balance,
      idempotencyKey, reference,
    );

    // ── Persist reservation ────────────────────────────────────────────────
    const reservation = await this.reservationRepository.create({
      id: randomUUID(),
      walletId: saved.id,
      idempotencyKey,
      amount,
      status: ReservationStatus.PENDING,
      reference,
      createdAt: new Date(),
    });

    return {
      reservationId: reservation.id,
      idempotencyKey: reservation.idempotencyKey,
      amount: reservation.amount,
      status: reservation.status,
      walletId: reservation.walletId,
    };
  }

  /**
   * Settle a reservation (triggered by message.sent event).
   * Idempotent: if already SETTLED, returns immediately.
   */
  async settle(reservationId: string): Promise<void> {
    const reservation = await this.reservationRepository.findById(reservationId);
    if (!reservation) throw new EntityNotFoundException('Reservation', reservationId);

    // ── Idempotency guard ──────────────────────────────────────────────────
    if (reservation.status === ReservationStatus.SETTLED) return;
    if (reservation.status === ReservationStatus.RELEASED) return; // also safe no-op

    // ── Apply settlement ───────────────────────────────────────────────────
    const wallet = await this.walletRepository.findById(reservation.walletId);
    if (!wallet) throw new EntityNotFoundException('Wallet', reservation.walletId);
    const version = wallet.version;
    const before = wallet.balance;

    wallet.settleReservation(reservation.amount); // releases reservation + debits balance
    const saved = await this.walletRepository.saveWithVersion(wallet, version);

    await this.ledgerService.record(
      saved.id, WalletMovementType.DEBIT, reservation.amount, before, saved.balance,
      reservationId, 'Settlement of reservation',
    );

    await this.reservationRepository.settle(reservationId);
  }

  /**
   * Release a reservation (triggered by message.failed event).
   * Idempotent: if already RELEASED or SETTLED, returns immediately.
   */
  async release(reservationId: string): Promise<void> {
    const reservation = await this.reservationRepository.findById(reservationId);
    if (!reservation) throw new EntityNotFoundException('Reservation', reservationId);

    // ── Idempotency guard ──────────────────────────────────────────────────
    if (reservation.status === ReservationStatus.RELEASED) return;
    if (reservation.status === ReservationStatus.SETTLED) return;

    // ── Apply release ──────────────────────────────────────────────────────
    const wallet = await this.walletRepository.findById(reservation.walletId);
    if (!wallet) throw new EntityNotFoundException('Wallet', reservation.walletId);
    const version = wallet.version;
    const before = wallet.balance;

    wallet.releaseReservation(reservation.amount);
    const saved = await this.walletRepository.saveWithVersion(wallet, version);

    await this.ledgerService.record(
      saved.id, WalletMovementType.RELEASE, reservation.amount, before, saved.balance,
      reservationId, 'Release of failed message reservation',
    );

    await this.reservationRepository.release(reservationId);
  }
}
