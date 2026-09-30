import { SettlementService } from './settlement.service';
import { ReservationStatus } from '../interfaces/reservation-repository.interface';
import { WalletMovementType } from '../../ledger/interfaces/ledger-service.port';

describe('SettlementService – idempotency', () => {
  let service: SettlementService;
  let walletRepo: any;
  let ledgerService: any;
  let reservationRepo: any;
  let mockWallet: any;

  beforeEach(() => {
    mockWallet = {
      id: 'wallet-1',
      tenantId: 'tenant-1',
      balance: 1000,
      reservedBalance: 0,
      availableBalance: 1000,
      version: 0,
      currency: 'RWF',
      addReservation: jest.fn((amount: number) => { mockWallet.reservedBalance += amount; }),
      settleReservation: jest.fn((amount: number) => { mockWallet.reservedBalance -= amount; mockWallet.balance -= amount; }),
      releaseReservation: jest.fn((amount: number) => { mockWallet.reservedBalance -= amount; }),
    };

    walletRepo = {
      findByTenantId: jest.fn().mockResolvedValue(mockWallet),
      findById: jest.fn().mockResolvedValue(mockWallet),
      saveWithVersion: jest.fn().mockImplementation((w) => Promise.resolve({ ...w, version: w.version + 1, id: 'wallet-1' })),
    };

    ledgerService = {
      record: jest.fn().mockResolvedValue(undefined),
    };

    reservationRepo = {
      findByIdempotencyKey: jest.fn().mockResolvedValue(null),
      findById: jest.fn(),
      create: jest.fn().mockImplementation((data: any) => Promise.resolve({
        ...data, status: ReservationStatus.PENDING, settledAt: null, releasedAt: null, updatedAt: new Date(),
      })),
      settle: jest.fn().mockImplementation((id: string) => Promise.resolve({ id, status: ReservationStatus.SETTLED, settledAt: new Date() })),
      release: jest.fn().mockImplementation((id: string) => Promise.resolve({ id, status: ReservationStatus.RELEASED, releasedAt: new Date() })),
    };

    service = new SettlementService(walletRepo, ledgerService, reservationRepo);
  });

  // ────────────────────────────────────────────────────────────────────────────
  // reserve() idempotency
  // ────────────────────────────────────────────────────────────────────────────

  it('reserve() creates a reservation and records a ledger entry', async () => {
    const result = await service.reserve('tenant-1', 100, 'idem-key-1');
    expect(reservationRepo.create).toHaveBeenCalledTimes(1);
    expect(ledgerService.record).toHaveBeenCalledWith(
      expect.any(String), WalletMovementType.RESERVE, 100, expect.any(Number), expect.any(Number), 'idem-key-1', undefined,
    );
    expect(result.status).toBe(ReservationStatus.PENDING);
  });

  it('reserve() with duplicate idempotencyKey returns existing reservation without touching wallet', async () => {
    const existing = {
      id: 'res-existing', walletId: 'wallet-1', idempotencyKey: 'idem-key-1',
      amount: 100, status: ReservationStatus.PENDING, createdAt: new Date(), updatedAt: new Date(),
    };
    reservationRepo.findByIdempotencyKey.mockResolvedValue(existing);

    const result = await service.reserve('tenant-1', 100, 'idem-key-1');
    expect(walletRepo.saveWithVersion).not.toHaveBeenCalled();
    expect(reservationRepo.create).not.toHaveBeenCalled();
    expect(ledgerService.record).not.toHaveBeenCalled();
    expect(result.reservationId).toBe('res-existing');
  });

  it('reserve() throws when available balance is insufficient', async () => {
    mockWallet.addReservation = jest.fn(() => { throw new Error('Insufficient available balance for reservation'); });
    await expect(service.reserve('tenant-1', 5000, 'idem-key-2')).rejects.toThrow('Insufficient');
    expect(reservationRepo.create).not.toHaveBeenCalled();
  });

  // ────────────────────────────────────────────────────────────────────────────
  // settle() idempotency
  // ────────────────────────────────────────────────────────────────────────────

  it('settle() marks reservation as SETTLED and records ledger debit', async () => {
    const reservation = { id: 'res-1', walletId: 'wallet-1', amount: 100, status: ReservationStatus.PENDING };
    reservationRepo.findById.mockResolvedValue(reservation);

    await service.settle('res-1');
    expect(walletRepo.saveWithVersion).toHaveBeenCalledTimes(1);
    expect(ledgerService.record).toHaveBeenCalledWith(
      expect.any(String), WalletMovementType.DEBIT, 100, expect.any(Number), expect.any(Number), 'res-1', 'Settlement of reservation',
    );
    expect(reservationRepo.settle).toHaveBeenCalledWith('res-1');
  });

  it('settle() on already-SETTLED reservation is a no-op', async () => {
    reservationRepo.findById.mockResolvedValue({ id: 'res-1', walletId: 'wallet-1', amount: 100, status: ReservationStatus.SETTLED });
    await service.settle('res-1');
    expect(walletRepo.saveWithVersion).not.toHaveBeenCalled();
    expect(ledgerService.record).not.toHaveBeenCalled();
    expect(reservationRepo.settle).not.toHaveBeenCalled();
  });

  it('settle() on RELEASED reservation is also a no-op', async () => {
    reservationRepo.findById.mockResolvedValue({ id: 'res-1', walletId: 'wallet-1', amount: 100, status: ReservationStatus.RELEASED });
    await service.settle('res-1');
    expect(walletRepo.saveWithVersion).not.toHaveBeenCalled();
  });

  // ────────────────────────────────────────────────────────────────────────────
  // release() idempotency
  // ────────────────────────────────────────────────────────────────────────────

  it('release() releases reservation and records ledger entry', async () => {
    const reservation = { id: 'res-1', walletId: 'wallet-1', amount: 100, status: ReservationStatus.PENDING };
    reservationRepo.findById.mockResolvedValue(reservation);

    await service.release('res-1');
    expect(walletRepo.saveWithVersion).toHaveBeenCalledTimes(1);
    expect(ledgerService.record).toHaveBeenCalledWith(
      expect.any(String), WalletMovementType.RELEASE, 100, expect.any(Number), expect.any(Number), 'res-1', 'Release of failed message reservation',
    );
    expect(reservationRepo.release).toHaveBeenCalledWith('res-1');
  });

  it('release() on already-RELEASED reservation is a no-op', async () => {
    reservationRepo.findById.mockResolvedValue({ id: 'res-1', walletId: 'wallet-1', amount: 100, status: ReservationStatus.RELEASED });
    await service.release('res-1');
    expect(walletRepo.saveWithVersion).not.toHaveBeenCalled();
    expect(reservationRepo.release).not.toHaveBeenCalled();
  });

  it('release() on already-SETTLED reservation is a no-op', async () => {
    reservationRepo.findById.mockResolvedValue({ id: 'res-1', walletId: 'wallet-1', amount: 100, status: ReservationStatus.SETTLED });
    await service.release('res-1');
    expect(walletRepo.saveWithVersion).not.toHaveBeenCalled();
  });
});
