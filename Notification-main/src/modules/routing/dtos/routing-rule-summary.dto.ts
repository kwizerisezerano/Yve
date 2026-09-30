import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoutingRuleAction, RoutingRuleStatus } from '../entities/routing-rule.entity';

export class RoutingRuleSummaryDto {
  @ApiProperty({ example: 'b3f1e2a4-1c2d-4e5f-8a9b-0c1d2e3f4a5b' })
  id!: string;

  @ApiPropertyOptional({ example: 'RW', nullable: true })
  country!: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  operator!: string | null;

  @ApiPropertyOptional({ example: 'sms', nullable: true })
  type!: string | null;

  @ApiProperty({ example: 'b3f1e2a4-1c2d-4e5f-8a9b-0c1d2e3f4a5b' })
  providerId!: string;

  @ApiProperty({ example: 'mtn' })
  providerName!: string;

  @ApiProperty({ enum: RoutingRuleAction, example: RoutingRuleAction.ALLOW })
  action!: RoutingRuleAction;

  @ApiProperty({ example: 10 })
  priority!: number;

  @ApiPropertyOptional({ example: 0.02, nullable: true })
  cost!: number | null;

  @ApiProperty({ enum: RoutingRuleStatus, example: RoutingRuleStatus.ACTIVE })
  status!: RoutingRuleStatus;

  @ApiProperty({ example: '2026-08-24T14:07:35.983Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-08-24T14:07:35.983Z' })
  updatedAt!: string;
}
