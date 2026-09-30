import { ApiProperty } from '@nestjs/swagger';

class RegeneratedKeyDto {
  @ApiProperty({ example: 'b3f1e2a4-1c2d-4e5f-8a9b-0c1d2e3f4a5b' })
  tenantId!: string;

  @ApiProperty({
    description: 'The new raw api key. Shown once, at creation time. It cannot be retrieved again.',
    example: 'ntf_9f1c2a3b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e',
  })
  apiKey!: string;
}

export class RegenerateTenantKeyResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Api key regenerated.' })
  message!: string;

  @ApiProperty({ type: RegeneratedKeyDto })
  data!: RegeneratedKeyDto;
}
