import { ApiProperty } from '@nestjs/swagger';
import { RoutingRuleSummaryDto } from './routing-rule-summary.dto';

export class RoutingRuleResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Routing rule found.' })
  message!: string;

  @ApiProperty({ type: RoutingRuleSummaryDto })
  data!: RoutingRuleSummaryDto;
}

export class RoutingRuleListResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Routing rules found.' })
  message!: string;

  @ApiProperty({ type: [RoutingRuleSummaryDto] })
  data!: RoutingRuleSummaryDto[];
}
