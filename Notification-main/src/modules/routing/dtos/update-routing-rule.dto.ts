import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
} from 'class-validator';
import { RoutingRuleAction, RoutingRuleStatus } from '../entities/routing-rule.entity';

export class UpdateRoutingRuleDto {
  @ApiPropertyOptional({ description: 'ISO 3166-1 alpha-2 country code.', example: 'RW' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: 'country must be a 2 letter uppercase ISO code' })
  country?: string;

  @ApiPropertyOptional({ description: 'Mobile operator.', example: 'MTN' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  operator?: string;

  @ApiPropertyOptional({ description: 'Message type.', example: 'sms' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  type?: string;

  @ApiPropertyOptional({
    description: 'Id of the registered provider this rule names.',
    example: 'b3f1e2a4-1c2d-4e5f-8a9b-0c1d2e3f4a5b',
  })
  @IsOptional()
  @IsUUID()
  providerId?: string;

  @ApiPropertyOptional({
    description: 'Allow or block this provider for the matching criteria.',
    enum: RoutingRuleAction,
    example: RoutingRuleAction.ALLOW,
  })
  @IsOptional()
  @IsEnum(RoutingRuleAction)
  action?: RoutingRuleAction;

  @ApiPropertyOptional({ description: 'Ranking among matching allow rules, higher is tried first.', example: 10 })
  @IsOptional()
  @IsInt()
  priority?: number;

  @ApiPropertyOptional({
    description: 'Informational cost figure for this provider, not used for billing.',
    example: 0.02,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @ApiPropertyOptional({
    description: 'Set to disabled to stop this rule from being considered, without deleting it.',
    enum: RoutingRuleStatus,
    example: RoutingRuleStatus.DISABLED,
  })
  @IsOptional()
  @IsEnum(RoutingRuleStatus)
  status?: RoutingRuleStatus;
}
