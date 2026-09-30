import { ApiProperty } from '@nestjs/swagger';

class TenantDto {
  @ApiProperty({ example: 'b3f1e2a4-1c2d-4e5f-8a9b-0c1d2e3f4a5b' })
  tenantId!: string;

  @ApiProperty({ example: 'Acme Inc' })
  name!: string;

  @ApiProperty({ example: '+15551234567' })
  phone!: string;

  @ApiProperty({ example: 'ACME' })
  defaultSender!: string;

  @ApiProperty({
    description: 'The raw api key. Shown once, at creation time. It cannot be retrieved again.',
    example: 'ntf_9f1c2a3b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e',
  })
  apiKey!: string;
}

export class RegisterTenantResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Tenant registered.' })
  message!: string;

  @ApiProperty({ type: TenantDto })
  data!: TenantDto;
}
