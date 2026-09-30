import { ApiProperty } from '@nestjs/swagger';

export class WhitelistedIpEntity {
  @ApiProperty({ example: 'b1e2c3d4-5678-4abc-9def-0123456789ab' })
  id: string;

  @ApiProperty({ example: '203.0.113.42' })
  ipAddress: string;

  @ApiProperty({ nullable: true, example: 'Office network' })
  description: string | null;

  @ApiProperty()
  createdAt: Date;
}
