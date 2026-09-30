import { ApiProperty } from '@nestjs/swagger';
import { AccountEntity } from './account.entity';

export class CreateAccountResponseDto {
  @ApiProperty({ type: AccountEntity })
  account: AccountEntity;

  @ApiProperty({
    description:
      'Raw API key for this account. Shown only once — store it now, it cannot be retrieved again.',
    example: 'sk_test_example_api_key_replace_with_real_key',
  })
  apiKey: string;
}
