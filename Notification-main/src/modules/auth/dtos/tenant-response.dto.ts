import { ApiProperty } from '@nestjs/swagger';
import { TenantSummaryDto } from './tenant-summary.dto';

export class TenantResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Tenant found.' })
  message!: string;

  @ApiProperty({ type: TenantSummaryDto })
  data!: TenantSummaryDto;
}

export class TenantListResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Tenants found.' })
  message!: string;

  @ApiProperty({ type: [TenantSummaryDto] })
  data!: TenantSummaryDto[];
}
