import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class SetTenantWebhookDto {
  @ApiProperty({
    description: "The URL Notification calls back with a message's final status.",
    example: 'https://example.com/webhooks/notification',
  })
  @IsUrl({ require_tld: false, require_protocol: true })
  webhookUrl!: string;
}
