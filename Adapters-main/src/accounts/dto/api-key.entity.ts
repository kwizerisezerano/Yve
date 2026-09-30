import { ApiProperty } from '@nestjs/swagger';

export class ApiKeyEntity {
  @ApiProperty({ example: '2b6e1f2a-9c3d-4e3a-9f0b-1234567890ab' })
  id: string;

  @ApiProperty({ example: 'sk_test_' })
  keyPrefix: string;

  @ApiProperty({ example: false })
  revoked: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ nullable: true, example: null })
  lastUsedAt: Date | null;
}
