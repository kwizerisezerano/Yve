import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

@Injectable()
export class TelemetryService {
  constructor(private readonly prisma: PrismaService) {}

  async record(tenantId: string, eventType: string, payload: Record<string, unknown>): Promise<void> {
    await this.prisma.telemetryEvent.create({
      data: { tenantId, eventType, payload: payload as any },
    });
    // TODO: publish telemetry.* event to RabbitMQ when broker is wired in
  }

  async findByTenant(tenantId: string, eventType?: string, limit = 50): Promise<any[]> {
    return this.prisma.telemetryEvent.findMany({
      where: { tenantId, ...(eventType ? { eventType } : {}) },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
