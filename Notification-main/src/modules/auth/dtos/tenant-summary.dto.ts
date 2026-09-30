import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TenantStatus } from '../entities/tenant.entity';

export class TenantSummaryDto {
  @ApiProperty({ example: 'b3f1e2a4-1c2d-4e5f-8a9b-0c1d2e3f4a5b' })
  id!: string;

  @ApiProperty({ example: 'Acme Inc' })
  name!: string;

  @ApiProperty({ example: '+15551234567' })
  phone!: string;

  @ApiProperty({ example: 'ACME' })
  defaultSender!: string;

  @ApiPropertyOptional({ example: 'https://example.com/webhooks/notification', nullable: true })
  webhookUrl!: string | null;

  @ApiProperty({ enum: TenantStatus, example: TenantStatus.ACTIVE })
  status!: TenantStatus;

  @ApiProperty({ example: '2026-08-24T14:07:35.983Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-08-24T14:07:35.983Z' })
  updatedAt!: string;
}
