import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { PHONE_NUMBER_PATTERN } from '../../../shared/common/phone-number.pattern';

export class RegisterTenantDto {
  @ApiProperty({ description: 'The tenant name.', example: 'Acme Inc' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ description: 'The tenant contact phone number.', example: '+15551234567' })
  @IsString()
  @Matches(PHONE_NUMBER_PATTERN)
  phone!: string;

  @ApiPropertyOptional({
    description: 'The sender id shown to recipients. Falls back to the phone number when omitted.',
    example: 'ACME',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  defaultSender?: string;
}
