import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIP, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateWhitelistedIpDto {
  @ApiProperty({ example: '203.0.113.42' })
  @IsIP()
  ipAddress: string;

  @ApiPropertyOptional({ example: 'Office network', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
