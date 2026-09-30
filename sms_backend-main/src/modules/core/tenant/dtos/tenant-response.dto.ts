import { ApiProperty } from '@nestjs/swagger';
import { Tenant, TenantStatus } from '../entities/tenant.entity';

export class TenantResponseDto {
  @ApiProperty({ format: 'uuid' })
  readonly id: string;

  @ApiProperty({ example: 'Acme Corp' })
  readonly name: string;

  @ApiProperty({ enum: TenantStatus })
  readonly status: string;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;

  private constructor(props: TenantResponseDto) {
    this.id = props.id;
    this.name = props.name;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static fromEntity(tenant: Tenant): TenantResponseDto {
    return new TenantResponseDto({
      id: tenant.id,
      name: tenant.name,
      status: tenant.status,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    });
  }
}
