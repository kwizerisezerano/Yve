import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';

export class SendSmsDto {
  @ApiProperty({
    description: "Core's own identifier for this message.",
    example: 'core-msg-12345',
  })
  @IsString()
  @IsNotEmpty()
  message_id: string;

  @ApiProperty({
    description: 'Destination phone number, E.164 format.',
    example: '+15551234567',
  })
  @Matches(/^\+?[1-9]\d{6,14}$/, {
    message: 'msisdn must be a valid phone number in E.164 format.',
  })
  msisdn: string;

  @ApiProperty({ example: 'Your OTP is 123456' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1600)
  message: string;

  @ApiProperty({ example: 'MyBrand' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  sender_id: string;

  @ApiProperty({
    description:
      "Core's webhook — called once we know the final delivery status.",
    example: 'https://core.example.com/webhooks/sms-status',
  })
  @IsUrl({ require_tld: false })
  callback_url: string;
}
