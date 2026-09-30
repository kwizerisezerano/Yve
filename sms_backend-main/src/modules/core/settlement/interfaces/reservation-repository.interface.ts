export enum ReservationStatus {
  PENDING = 'PENDING',
  SETTLED = 'SETTLED',
  RELEASED = 'RELEASED',
}

export interface ReservationRecord {
  id: string;
  walletId: string;
  idempotencyKey: string;
  amount: number;
  status: ReservationStatus;
  reference?: string;
  settledAt?: Date;
  releasedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const RESERVATION_REPOSITORY = 'RESERVATION_REPOSITORY';

export interface ReservationRepository {
  create(record: Omit<ReservationRecord, 'settledAt' | 'releasedAt' | 'updatedAt'>): Promise<ReservationRecord>;
  findByIdempotencyKey(key: string): Promise<ReservationRecord | null>;
  findById(id: string): Promise<ReservationRecord | null>;
  settle(id: string): Promise<ReservationRecord>;
  release(id: string): Promise<ReservationRecord>;
}
