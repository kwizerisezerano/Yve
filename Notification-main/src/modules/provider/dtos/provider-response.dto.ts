import { ApiProperty } from '@nestjs/swagger';
import { ProviderSummaryDto } from './provider-summary.dto';

export class ProviderResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Provider found.' })
  message!: string;

  @ApiProperty({ type: ProviderSummaryDto })
  data!: ProviderSummaryDto;
}

export class ProviderListResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Providers found.' })
  message!: string;

  @ApiProperty({ type: [ProviderSummaryDto] })
  data!: ProviderSummaryDto[];
}
