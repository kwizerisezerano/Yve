import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { ProviderService } from '../services/provider.service';

@ApiTags('providers')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('providers')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Get()
  @ApiOperation({ summary: 'List all active providers' })
  async list() {
    return this.providerService.listActive();
  }
}
