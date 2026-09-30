import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApiKeyDto {
  @ApiProperty({
    example: 'Production API Key',
    description: 'Descriptive name for the API key',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: '2024-12-31T23:59:59Z',
    description: 'Optional expiration date for the API key',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
