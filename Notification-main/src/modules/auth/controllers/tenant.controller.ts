import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse as SwaggerApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ApiResponse } from '../../../shared/common/api-response';
import { ErrorResponseDto } from '../../../shared/common/error-response.dto';
import { Tenant } from '../entities/tenant.entity';
import { RegenerateTenantKeyResponseDto } from '../dtos/regenerate-tenant-key-response.dto';
import { RegisterTenantResponseDto } from '../dtos/register-tenant-response.dto';
import { RegisterTenantDto } from '../dtos/register-tenant.dto';
import { SetTenantWebhookDto } from '../dtos/set-tenant-webhook.dto';
import { TenantListResponseDto, TenantResponseDto } from '../dtos/tenant-response.dto';
import { TenantSummaryDto } from '../dtos/tenant-summary.dto';
import { TenantWebhookResponseDto } from '../dtos/tenant-webhook-response.dto';
import { UpdateTenantDto } from '../dtos/update-tenant.dto';
import { TenantRegistrationService } from '../services/tenant-registration.service';
import { TenantService } from '../services/tenant.service';

function toSummary(tenant: Tenant): TenantSummaryDto {
  return {
    id: tenant.id,
    name: tenant.name,
    phone: tenant.phone,
    defaultSender: tenant.defaultSender,
    webhookUrl: tenant.webhookUrl,
    status: tenant.status,
    createdAt: tenant.createdAt.toISOString(),
    updatedAt: tenant.updatedAt.toISOString(),
  };
}

@ApiTags('tenants')
@Controller('tenants')
export class TenantController {
  constructor(
    private readonly registration: TenantRegistrationService,
    private readonly tenants: TenantService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Register a tenant account.',
    description:
      'Takes basic tenant information, generates a new api key, stores only its hash, and ' +
      'returns the tenant id and the raw api key. The raw key is shown once and cannot be ' +
      'retrieved again.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tenant registered.',
    type: RegisterTenantResponseDto,
  })
  async create(@Body() dto: RegisterTenantDto, @Res() res: Response): Promise<void> {
    const { tenant, rawApiKey } = await this.registration.register(dto);
    ApiResponse.success(
      res,
      'Tenant registered.',
      {
        tenantId: tenant.id,
        name: tenant.name,
        phone: tenant.phone,
        defaultSender: tenant.defaultSender,
        apiKey: rawApiKey,
      },
      HttpStatus.CREATED,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List tenants.' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Tenants found.', type: TenantListResponseDto })
  async findAll(@Res() res: Response): Promise<void> {
    const tenants = await this.tenants.findAll();
    ApiResponse.success(res, 'Tenants found.', tenants.map(toSummary), HttpStatus.OK);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one tenant by id.' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Tenant found.', type: TenantResponseDto })
  @SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tenant not found.', type: ErrorResponseDto })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res() res: Response,
  ): Promise<void> {
    const tenant = await this.tenants.findById(id);
    ApiResponse.success(res, 'Tenant found.', toSummary(tenant), HttpStatus.OK);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a tenant. Set status to disabled to revoke its api key at once.',
  })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Tenant updated.', type: TenantResponseDto })
  @SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tenant not found.', type: ErrorResponseDto })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTenantDto,
    @Res() res: Response,
  ): Promise<void> {
    const tenant = await this.tenants.update(id, dto);
    ApiResponse.success(res, 'Tenant updated.', toSummary(tenant), HttpStatus.OK);
  }

  @Post(':id/regenerate-key')
  @ApiOperation({
    summary: "Regenerate a tenant's api key.",
    description:
      'Generates a new api key, stores only its hash, and returns the raw key. The old key stops ' +
      'working immediately. The raw key is shown once and cannot be retrieved again.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.CREATED,
    description: 'Api key regenerated.',
    type: RegenerateTenantKeyResponseDto,
  })
  @SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tenant not found.', type: ErrorResponseDto })
  async regenerateKey(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res() res: Response,
  ): Promise<void> {
    const { tenant, rawApiKey } = await this.registration.regenerateKey(id);
    ApiResponse.success(
      res,
      'Api key regenerated.',
      { tenantId: tenant.id, apiKey: rawApiKey },
      HttpStatus.CREATED,
    );
  }

  @Get(':id/webhook')
  @ApiOperation({ summary: "Read a tenant's webhook URL." })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Tenant webhook found.',
    type: TenantWebhookResponseDto,
  })
  @SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tenant not found.', type: ErrorResponseDto })
  async getWebhook(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res() res: Response,
  ): Promise<void> {
    const tenant = await this.tenants.findById(id);
    ApiResponse.success(res, 'Tenant webhook found.', { webhookUrl: tenant.webhookUrl }, HttpStatus.OK);
  }

  @Put(':id/webhook')
  @ApiOperation({
    summary: "Set a tenant's webhook URL.",
    description:
      'Notification calls this URL back with a message.delivered or message.dead_lettered ' +
      'outcome, with a bounded retry. Replaces any previously set URL.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Tenant webhook set.',
    type: TenantWebhookResponseDto,
  })
  @SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tenant not found.', type: ErrorResponseDto })
  async setWebhook(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: SetTenantWebhookDto,
    @Res() res: Response,
  ): Promise<void> {
    const tenant = await this.tenants.update(id, { webhookUrl: dto.webhookUrl });
    ApiResponse.success(res, 'Tenant webhook set.', { webhookUrl: tenant.webhookUrl }, HttpStatus.OK);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a tenant.',
    description: 'Fails with a conflict if the tenant still has messages.',
  })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Tenant deleted.' })
  @SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tenant not found.', type: ErrorResponseDto })
  @SwaggerApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'The tenant still has messages.',
    type: ErrorResponseDto,
  })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res() res: Response,
  ): Promise<void> {
    await this.tenants.delete(id);
    ApiResponse.success(res, 'Tenant deleted.', null, HttpStatus.OK);
  }
}
