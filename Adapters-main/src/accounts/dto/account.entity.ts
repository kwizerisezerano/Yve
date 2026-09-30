import { ApiProperty } from '@nestjs/swagger';
import { AccountStatus } from '../../../generated/prisma/client';

export class AccountEntity {
  @ApiProperty({ example: 'd5263591-3693-4d36-8d55-38c83c516b89' })
  id: string;

  @ApiProperty({ example: 'Core System' })
  name: string;

  @ApiProperty({ example: 'core@yourcompany.com' })
  email: string;

  @ApiProperty({ enum: AccountStatus, example: AccountStatus.ACTIVE })
  status: AccountStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
