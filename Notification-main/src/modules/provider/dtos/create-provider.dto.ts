import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProviderDto {
  @ApiProperty({
    description:
      'The provider name. This is the identifier used inside routing rules and is the same ' +
      'name Adapters is asked about for health, it must match whatever Adapters calls this provider.',
    example: 'mtn',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'A human readable description.', example: 'MTN Rwanda' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description:
      'Default cost used as a fallback when a matching routing rule does not set its own cost. ' +
      'Informational, not used for billing.',
    example: 0.02,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultCost?: number;
}
