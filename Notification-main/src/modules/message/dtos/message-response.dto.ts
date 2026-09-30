import { ApiProperty } from '@nestjs/swagger';
import { MessageSummaryDto } from './message-summary.dto';

export class MessageResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Message found.' })
  message!: string;

  @ApiProperty({ type: MessageSummaryDto })
  data!: MessageSummaryDto;
}

export class MessageListResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Messages found.' })
  message!: string;

  @ApiProperty({ type: [MessageSummaryDto] })
  data!: MessageSummaryDto[];
}
