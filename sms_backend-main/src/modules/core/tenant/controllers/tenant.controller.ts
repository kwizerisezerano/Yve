import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTenantDto } from '../dtos/create-tenant.dto';
import { TenantResponseDto } from '../dtos/tenant-response.dto';
import { UpdateTenantDto } from '../dtos/update-tenant.dto';
import { TenantService } from '../services/tenant.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('tenants')
@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @ApiOperation({ summary: 'Create a tenant' })
  @ApiResponse({ status: 201, type: TenantResponseDto })
  async create(@Body() dto: CreateTenantDto): Promise<TenantResponseDto> {
    const tenant = await this.tenantService.create(dto.name);
    return TenantResponseDto.fromEntity(tenant);
  }

  @Get()
  @ApiOperation({ summary: 'List all tenants' })
  @ApiResponse({ status: 200, type: [TenantResponseDto] })
  async list(): Promise<TenantResponseDto[]> {
    const tenants = await this.tenantService.list();
    return tenants.map((tenant) => TenantResponseDto.fromEntity(tenant));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current authenticated tenant details' })
  @ApiResponse({ status: 200, type: TenantResponseDto })
  async getMe(@Req() req: any): Promise<TenantResponseDto> {
    const tenantId = req.user?.tenantId ?? 'seed-tenant-001';
    const tenant = await this.tenantService.getById(tenantId);
    return TenantResponseDto.fromEntity(tenant);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tenant by id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: TenantResponseDto })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async getById(@Param('id', ParseUUIDPipe) id: string): Promise<TenantResponseDto> {
    const tenant = await this.tenantService.getById(id);
    return TenantResponseDto.fromEntity(tenant);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tenant' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: TenantResponseDto })
  @ApiResponse({ status: 400, description: 'Tenant is closed and cannot be renamed' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTenantDto,
  ): Promise<TenantResponseDto> {
    const tenant = await this.tenantService.update(id, dto.name);
    return TenantResponseDto.fromEntity(tenant);
  }

  @Post(':id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend a tenant' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: TenantResponseDto })
  @ApiResponse({ status: 400, description: 'Tenant is closed and cannot be suspended' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async suspend(@Param('id', ParseUUIDPipe) id: string): Promise<TenantResponseDto> {
    const tenant = await this.tenantService.suspend(id);
    return TenantResponseDto.fromEntity(tenant);
  }

  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Close a tenant' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: TenantResponseDto })
  @ApiResponse({ status: 400, description: 'Tenant is already closed' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async close(@Param('id', ParseUUIDPipe) id: string): Promise<TenantResponseDto> {
    const tenant = await this.tenantService.close(id);
    return TenantResponseDto.fromEntity(tenant);
  }
}
