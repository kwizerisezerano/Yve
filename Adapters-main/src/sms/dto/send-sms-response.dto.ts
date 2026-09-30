import { ApiProperty } from '@nestjs/swagger';
import { SmsStatus } from '../../../generated/prisma/client';

export class SendSmsResponseDto {
  @ApiProperty({
    description:
      "This adapter's id for the message — use it to correlate later.",
    example: 'a1b2c3d4-5678-4abc-9def-0123456789ab',
  })
  adapterId: string;

  @ApiProperty({
    description: "Echoes Core's own message_id back for correlation.",
    example: 'core-msg-12345',
  })
  messageId: string;

  @ApiProperty({ enum: SmsStatus, example: SmsStatus.RECEIVED })
  status: SmsStatus;

  @ApiProperty()
  createdAt: Date;
}
