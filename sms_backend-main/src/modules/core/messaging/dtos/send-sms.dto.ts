import { IsString, IsArray, IsOptional, MinLength, MaxLength, ArrayMinSize, ArrayMaxSize, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendSmsDto {
  @ApiProperty({
    description: 'Array of phone numbers in international format',
    example: ['+250788123456', '+250788234567'],
    minItems: 1,
    maxItems: 100,
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one recipient is required' })
  @ArrayMaxSize(100, { message: 'Maximum 100 recipients per request' })
  @Matches(/^\+?[1-9]\d{1,14}$/, { each: true, message: 'Invalid phone number format' })
  to!: string[];

  @ApiProperty({
    description: 'SMS message content',
    example: 'Your verification code is 123456',
    minLength: 1,
    maxLength: 1600,
  })
  @IsString()
  @MinLength(1, { message: 'Message cannot be empty' })
  @MaxLength(1600, { message: 'Message too long (max 1600 characters = 10 SMS)' })
  message!: string;

  @ApiProperty({
    description: 'Sender ID/Name (must be approved for your account)',
    example: 'MYSTORE',
    required: true,
  })
  @IsString()
  @MinLength(3, { message: 'Sender ID must be at least 3 characters' })
  @MaxLength(11, { message: 'Sender ID must not exceed 11 characters' })
  from!: string;
}

export class SendSmsResponseDto {
  @ApiProperty({ description: 'Batch ID for tracking' })
  batchId!: string;

  @ApiProperty({ description: 'Number of messages queued' })
  totalMessages!: number;

  @ApiProperty({ description: 'Total cost in RWF' })
  totalCost!: number;

  @ApiProperty({ description: 'Cost per SMS in RWF' })
  smsCost!: number;

  @ApiProperty({ description: 'Status of the batch' })
  status!: string;

  @ApiProperty({ description: 'Individual message details' })
  messages!: MessageDetail[];
}

export class MessageDetail {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  to!: string;

  @ApiProperty()
  from!: string;

  @ApiProperty()
  message!: string;

  @ApiProperty()
  cost!: number;

  @ApiProperty()
  smsCount!: number;

  @ApiProperty()
  status!: string;
}
