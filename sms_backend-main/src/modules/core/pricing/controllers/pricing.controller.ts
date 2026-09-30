import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { TenantContext } from '../../../core/auth/decorators/tenant-context.decorator';
import { PricingService } from '../services/pricing.service';

@ApiTags('pricing')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get()
  @ApiOperation({ summary: 'Get price list for tenant (tenant-specific + global fallback)' })
  async list(@TenantContext() tenantId: string) {
    return this.pricingService.listForTenant(tenantId);
  }
}
