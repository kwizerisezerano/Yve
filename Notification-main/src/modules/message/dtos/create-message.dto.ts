import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { PHONE_NUMBER_PATTERN } from '../../../shared/common/phone-number.pattern';

export class CreateMessageDto {
  @ApiProperty({
    description:
      'One recipient number, or a list of recipient numbers. A single string is accepted and ' +
      'normalized into a one item list.',
    type: [String],
    example: ['+15551234567'],
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @Matches(PHONE_NUMBER_PATTERN, { each: true })
  recipient!: string[];

  @ApiProperty({ description: 'The text to send.', example: 'Your code is 123456.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1600)
  message!: string;

  @ApiProperty({
    description: 'The api key or token that identifies the tenant.',
    example: 'live_9f1c2a3b4d5e6f7a',
  })
  @IsString()
  @IsNotEmpty()
  authentication!: string;

  @ApiProperty({
    description: 'Identifies this request, so a retry never sends twice.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsString()
  @IsNotEmpty()
  idempotencyKey!: string;

  @ApiPropertyOptional({
    description: "The sender id. Falls back to the tenant's default sender when omitted.",
    example: 'ACME',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  sender?: string;

  @ApiPropertyOptional({ description: 'The message type. Falls back to sms when omitted.', example: 'sms' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  type?: string;
}
