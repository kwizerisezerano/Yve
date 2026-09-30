import { IsString, IsOptional, MinLength, MaxLength, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppDto {
  @ApiProperty({
    description: 'Application name',
    example: 'E-Commerce Platform',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3, { message: 'App name must be at least 3 characters' })
  @MaxLength(100, { message: 'App name must not exceed 100 characters' })
  name!: string;

  @ApiProperty({
    description: 'Application description',
    example: 'Main e-commerce application for online store',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @ApiProperty({
    description: 'Webhook URL to receive SMS delivery status updates',
    example: 'https://api.yourapp.com/webhooks/sms-status',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Webhook URL must be a valid URL' })
  webhookUrl?: string;

  @ApiProperty({
    description: 'Secret key for webhook signature verification',
    example: 'whsec_abc123xyz789',
    required: false,
  })
  @IsOptional()
  @IsString()
  webhookSecret?: string;
}
