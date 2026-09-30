import { ApiProperty } from '@nestjs/swagger';

class ErrorDetailsDto {
  @ApiProperty({ example: 'VALIDATION_ERROR' })
  code!: string;

  @ApiProperty({ example: '/messages' })
  path!: string;

  @ApiProperty({ example: '2026-08-24T14:07:35.983Z' })
  timestamp!: string;
}

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success!: boolean;

  @ApiProperty({ example: 'An error occurred' })
  message!: string;

  @ApiProperty({ type: ErrorDetailsDto })
  data!: ErrorDetailsDto;
}
