import { IsString, IsEnum, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum MessageStatus {
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  UNDELIVERED = 'UNDELIVERED',
}

export class MessageStatusUpdateDto {
  @ApiProperty({
    description: 'Provider message ID or recipient phone number',
    example: 'msg_xyz123',
  })
  @IsString()
  messageId!: string;

  @ApiProperty({
    description: 'Recipient phone number',
    example: '+250783503691',
  })
  @IsString()
  recipient!: string;

  @ApiProperty({
    description: 'Current status of the message',
    enum: MessageStatus,
    example: MessageStatus.DELIVERED,
  })
  @IsEnum(MessageStatus)
  status!: MessageStatus;

  @ApiProperty({
    description: 'Error code if message failed',
    example: 'INVALID_NUMBER',
    required: false,
  })
  @IsOptional()
  @IsString()
  errorCode?: string;

  @ApiProperty({
    description: 'Error message if message failed',
    example: 'Invalid phone number format',
    required: false,
  })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiProperty({
    description: 'Timestamp when message was delivered',
    example: '2026-08-27T12:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  deliveredAt?: string;
}

export class WebhookPayloadDto {
  @ApiProperty({
    description: 'Batch ID (idempotency key from the original request)',
    example: 'batch_1234567890_abc123',
  })
  @IsString()
  batchId!: string;

  @ApiProperty({
    description: 'Array of message status updates',
    type: [MessageStatusUpdateDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageStatusUpdateDto)
  messages!: MessageStatusUpdateDto[];

  @ApiProperty({
    description: 'Webhook signature for verification (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  signature?: string;
}

export class WebhookResponseDto {
  @ApiProperty({
    description: 'Whether the webhook was processed successfully',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Number of messages updated',
    example: 5,
  })
  messagesUpdated!: number;

  @ApiProperty({
    description: 'Error message if processing failed',
    example: 'Batch not found',
    required: false,
  })
  error?: string;
}
