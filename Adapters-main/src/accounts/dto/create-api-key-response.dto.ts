import { ApiProperty } from '@nestjs/swagger';

export class CreateApiKeyResponseDto {
  @ApiProperty({ example: '2b6e1f2a-9c3d-4e3a-9f0b-1234567890ab' })
  id: string;

  @ApiProperty({ example: 'sk_test_' })
  keyPrefix: string;

  @ApiProperty({
    description:
      'Raw API key. Shown only once — store it now, it cannot be retrieved again.',
    example: 'sk_test_example_api_key_replace_with_real_key',
  })
  apiKey: string;

  @ApiProperty()
  createdAt: Date;
}
