import { ApiProperty } from '@nestjs/swagger';

class MessageIdsDto {
  @ApiProperty({
    description: 'One id per recipient, in the same order as the request.',
    type: [String],
    example: ['b3f1e2a4-1c2d-4e5f-8a9b-0c1d2e3f4a5b'],
  })
  ids!: string[];
}

export class CreateMessageResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Messages queued.' })
  message!: string;

  @ApiProperty({ type: MessageIdsDto })
  data!: MessageIdsDto;
}
