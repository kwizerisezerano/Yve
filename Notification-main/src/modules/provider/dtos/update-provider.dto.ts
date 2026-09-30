import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ProviderStatus } from '../entities/provider.entity';

export class UpdateProviderDto {
  @ApiPropertyOptional({ description: 'The provider name.', example: 'mtn' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ description: 'A human readable description.', example: 'MTN Rwanda' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Default cost used as a fallback when a matching routing rule does not set its own cost.',
    example: 0.02,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultCost?: number;

  @ApiPropertyOptional({
    description:
      'Set to disabled to pull this provider out of routing without touching its rules.',
    enum: ProviderStatus,
    example: ProviderStatus.DISABLED,
  })
  @IsOptional()
  @IsEnum(ProviderStatus)
  status?: ProviderStatus;
}
