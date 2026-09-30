import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentMethod {
  MOMO = 'MOMO',
  BANK_CARD = 'BANK_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export class InitiateTopupDto {
  @ApiProperty({ example: 10000, description: 'Amount to top up in RWF' })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount!: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.MOMO })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiProperty({ example: '250788123456', required: false, description: 'Phone number for MOMO' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class ConfirmTopupDto {
  @ApiProperty({ example: 'txn-123456' })
  @IsString()
  transactionId!: string;

  @ApiProperty({ example: 'SUCCESS' })
  @IsString()
  status!: string;
}

export interface TopupTransaction {
  id: string;
  tenantId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  phoneNumber?: string;
  reference: string;
  createdAt: Date;
  updatedAt: Date;
}
