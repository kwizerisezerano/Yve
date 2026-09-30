import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProviderStatus } from '../entities/provider.entity';

export class ProviderSummaryDto {
  @ApiProperty({ example: 'b3f1e2a4-1c2d-4e5f-8a9b-0c1d2e3f4a5b' })
  id!: string;

  @ApiProperty({ example: 'mtn' })
  name!: string;

  @ApiPropertyOptional({ example: 'MTN Rwanda', nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ example: 0.02, nullable: true })
  defaultCost!: number | null;

  @ApiProperty({ enum: ProviderStatus, example: ProviderStatus.ACTIVE })
  status!: ProviderStatus;

  @ApiProperty({ example: '2026-08-24T14:07:35.983Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-08-24T14:07:35.983Z' })
  updatedAt!: string;
}
