import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OnboardingService } from '../services/onboarding.service';

class OnboardTenantDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @IsNotEmpty()
  tenantName!: string;

  @ApiProperty({ example: 'admin@acme.com' })
  @IsEmail()
  adminEmail!: string;

  @ApiProperty({ example: 'Admin123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  adminPassword!: string;

  @ApiProperty({ example: 'ACME', description: 'Initial sender ID to register', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  senderName?: string;
}

@ApiTags('onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post()
  @ApiOperation({ summary: 'Onboard a new tenant (creates tenant + admin user + wallet)' })
  async onboard(@Body() dto: OnboardTenantDto) {
    return this.onboardingService.onboard(dto.tenantName, dto.adminEmail, dto.adminPassword, dto.senderName);
  }
}
