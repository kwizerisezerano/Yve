import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { PHONE_NUMBER_PATTERN } from '../../../shared/common/phone-number.pattern';
import { TenantStatus } from '../entities/tenant.entity';

export class UpdateTenantDto {
  @ApiPropertyOptional({ description: 'The tenant name.', example: 'Acme Inc' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ description: 'The tenant contact phone number.', example: '+15551234567' })
  @IsOptional()
  @IsString()
  @Matches(PHONE_NUMBER_PATTERN)
  phone?: string;

  @ApiPropertyOptional({ description: 'The sender id shown to recipients.', example: 'ACME' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  defaultSender?: string;

  @ApiPropertyOptional({
    description: 'Set to disabled to revoke the api key at once.',
    enum: TenantStatus,
    example: TenantStatus.DISABLED,
  })
  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus;
}
