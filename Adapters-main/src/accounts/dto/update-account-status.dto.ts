import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { AccountStatus } from '../../../generated/prisma/client';

export class UpdateAccountStatusDto {
  @ApiProperty({ enum: AccountStatus, example: AccountStatus.SUSPENDED })
  @IsEnum(AccountStatus)
  status: AccountStatus;
}
