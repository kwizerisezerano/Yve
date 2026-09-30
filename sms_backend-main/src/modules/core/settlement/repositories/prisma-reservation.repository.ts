import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { ReservationRecord, ReservationRepository, ReservationStatus } from '../interfaces/reservation-repository.interface';

@Injectable()
export class PrismaReservationRepository implements ReservationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(record: Omit<ReservationRecord, 'settledAt' | 'releasedAt' | 'updatedAt'>): Promise<ReservationRecord> {
    const row = await this.prisma.reservation.create({
      data: {
        id: record.id,
        walletId: record.walletId,
        idempotencyKey: record.idempotencyKey,
        amount: record.amount,
        status: record.status,
        reference: record.reference,
      },
    });
    return this.toRecord(row);
  }

  async findByIdempotencyKey(key: string): Promise<ReservationRecord | null> {
    const row = await this.prisma.reservation.findUnique({ where: { idempotencyKey: key } });
    return row ? this.toRecord(row) : null;
  }

  async findById(id: string): Promise<ReservationRecord | null> {
    const row = await this.prisma.reservation.findUnique({ where: { id } });
    return row ? this.toRecord(row) : null;
  }

  async settle(id: string): Promise<ReservationRecord> {
    const row = await this.prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.SETTLED, settledAt: new Date() },
    });
    return this.toRecord(row);
  }

  async release(id: string): Promise<ReservationRecord> {
    const row = await this.prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.RELEASED, releasedAt: new Date() },
    });
    return this.toRecord(row);
  }

  private toRecord(row: any): ReservationRecord {
    return {
      id: row.id,
      walletId: row.walletId,
      idempotencyKey: row.idempotencyKey,
      amount: Number(row.amount),
      status: row.status as ReservationStatus,
      reference: row.reference ?? undefined,
      settledAt: row.settledAt ?? undefined,
      releasedAt: row.releasedAt ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
