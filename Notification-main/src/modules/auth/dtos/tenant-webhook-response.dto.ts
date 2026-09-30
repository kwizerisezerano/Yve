import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class TenantWebhookDto {
  @ApiPropertyOptional({ example: 'https://example.com/webhooks/notification', nullable: true })
  webhookUrl!: string | null;
}

export class TenantWebhookResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Tenant webhook found.' })
  message!: string;

  @ApiProperty({ type: TenantWebhookDto })
  data!: TenantWebhookDto;
}
