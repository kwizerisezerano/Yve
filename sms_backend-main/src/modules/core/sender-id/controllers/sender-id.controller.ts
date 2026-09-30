import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/auth/decorators/roles.decorator';
import { UserRole } from '../../../core/user/entities/user.entity';
import { ApiKeyGuard } from '../../../core/auth/guards/api-key.guard';
import { TenantContext } from '../../../core/auth/decorators/tenant-context.decorator';
import { SenderIdService } from '../services/sender-id.service';

class RegisterSenderIdDto {
  @ApiProperty({ example: 'INGOGA' })
  @IsString()
  @IsNotEmpty()
  name!: string;
}

@ApiTags('sender-ids')
@Controller()
export class SenderIdController {
  constructor(private readonly senderIdService: SenderIdService) {}

  @Post('sender-ids')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Register a new sender ID' })
  async register(@TenantContext() tenantId: string, @Body() dto: RegisterSenderIdDto) {
    return this.senderIdService.register(tenantId, dto.name);
  }

  @Get('sender-ids')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List sender IDs for tenant' })
  async list(@TenantContext() tenantId: string) {
    return this.senderIdService.listByTenant(tenantId);
  }

  @Patch('sender-ids/:id/approve')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Approve a sender ID (Super Admin only)' })
  async approve(@Param('id') id: string) {
    return this.senderIdService.approve(id);
  }

  @Patch('sender-ids/:id/reject')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Reject a sender ID (Super Admin only)' })
  async reject(@Param('id') id: string) {
    return this.senderIdService.reject(id);
  }

  @Post('internal/validate-sender')
  @ApiOperation({ summary: 'Validate sender ID for a tenant (internal, api-key auth)' })
  async validateSender(@Body() body: { tenantId: string; senderName: string }) {
    const valid = await this.senderIdService.validate(body.tenantId, body.senderName);
    return { valid, senderName: body.senderName, tenantId: body.tenantId };
  }
}
