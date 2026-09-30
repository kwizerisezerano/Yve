import { ApiProperty } from '@nestjs/swagger';
import { SmsStatus } from '../../../generated/prisma/client';

export class SmsMessageStatusDto {
  @ApiProperty({ example: 'a1b2c3d4-5678-4abc-9def-0123456789ab' })
  adapterId: string;

  @ApiProperty({ example: 'core-msg-12345' })
  messageId: string;

  @ApiProperty({ enum: SmsStatus, example: SmsStatus.DELIVERED })
  status: SmsStatus;

  @ApiProperty({ example: '+15551234567' })
  msisdn: string;

  @ApiProperty({ nullable: true, example: 'opco-ref-999' })
  opcoReference: string | null;

  @ApiProperty({ nullable: true, example: null })
  failureReason: string | null;

  @ApiProperty({ nullable: true, example: null })
  deliveredAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
