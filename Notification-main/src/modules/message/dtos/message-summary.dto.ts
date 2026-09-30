import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageStatus } from '../entities/message.entity';

export class MessageSummaryDto {
  @ApiProperty({ example: 'b3f1e2a4-1c2d-4e5f-8a9b-0c1d2e3f4a5b' })
  id!: string;

  @ApiProperty({ example: 'ACME' })
  sender!: string;

  @ApiProperty({ example: '+15551234567' })
  recipient!: string;

  @ApiProperty({ example: 'Your code is 123456.' })
  body!: string;

  @ApiProperty({ example: 'sms' })
  type!: string;

  @ApiProperty({ enum: MessageStatus, example: MessageStatus.QUEUED })
  status!: MessageStatus;

  @ApiPropertyOptional({ example: 'provider-a', nullable: true })
  provider!: string | null;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  idempotencyKey!: string;

  @ApiProperty({ example: '2026-08-24T14:07:35.983Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-08-24T14:07:35.983Z' })
  updatedAt!: string;
}
