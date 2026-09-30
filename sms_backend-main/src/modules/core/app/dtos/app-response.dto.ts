import { ApiProperty } from '@nestjs/swagger';
import { AppStatus } from '../entities/app.entity';

export class AppResponseDto {
  @ApiProperty({ description: 'App ID' })
  id!: string;

  @ApiProperty({ description: 'App name' })
  name!: string;

  @ApiProperty({ description: 'App description', nullable: true })
  description!: string | null;

  @ApiProperty({ description: 'Webhook URL for delivery status updates', nullable: true })
  webhookUrl!: string | null;

  @ApiProperty({ description: 'Webhook secret for signature verification', nullable: true })
  webhookSecret!: string | null;

  @ApiProperty({ description: 'App status', enum: AppStatus })
  status!: AppStatus;

  @ApiProperty({ description: 'Number of API keys' })
  apiKeyCount!: number;

  @ApiProperty({ description: 'Total messages sent' })
  messagesSent!: number;

  @ApiProperty({ description: 'Last time app was used', nullable: true })
  lastUsed!: Date | null;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt!: Date;
}
