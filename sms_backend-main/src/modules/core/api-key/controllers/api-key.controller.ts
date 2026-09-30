import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { TenantContext } from '../../../core/auth/decorators/tenant-context.decorator';
import { CreateApiKeyDto } from '../dtos/create-api-key.dto';
import { ApiKeyService } from '../services/api-key.service';
import { AppService } from '../../app/services/app.service';

@ApiTags('API Keys')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('apps/:appId/api-keys')
export class ApiKeyController {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly appService: AppService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Generate a new API key for an app',
    description: 'Creates a new API key for the specified app. The raw secret is returned and can be viewed anytime later.',
  })
  async generate(
    @Param('appId') appId: string,
    @TenantContext() tenantId: string,
    @Body() dto: CreateApiKeyDto,
  ) {
    // Verify app ownership
    await this.appService.verifyAppOwnership(appId, tenantId);

    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : undefined;
    const result = await this.apiKeyService.generate(appId, dto.name, expiresAt);
    
    // Map to frontend format
    return {
      id: result.id,
      appId: result.appId,
      name: result.name,
      key: result.rawSecret, // Frontend expects 'key' not 'rawSecret'
      keyPrefix: result.keyPrefix,
      status: 'ACTIVE',
      createdAt: result.createdAt,
      expiresAt: result.expiresAt,
      lastUsedAt: null,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'List API keys for an app',
    description: 'Retrieves all API keys for the specified app with full keys decrypted.',
  })
  async list(@Param('appId') appId: string, @TenantContext() tenantId: string) {
    // Verify app ownership
    await this.appService.verifyAppOwnership(appId, tenantId);

    return this.apiKeyService.listByAppWithKeys(appId);
  }

  @Get(':keyId')
  @ApiOperation({
    summary: 'Get API key details',
    description: 'Retrieves details for a specific API key with full key decrypted.',
  })
  async getOne(
    @Param('appId') appId: string,
    @Param('keyId') keyId: string,
    @TenantContext() tenantId: string,
  ) {
    // Verify app ownership
    await this.appService.verifyAppOwnership(appId, tenantId);

    return this.apiKeyService.getByIdWithKey(keyId, appId);
  }

  @Post(':keyId/revoke')
  @ApiOperation({
    summary: 'Revoke an API key',
    description: 'Marks an API key as revoked. Revoked keys cannot be used for authentication.',
  })
  async revoke(
    @Param('appId') appId: string,
    @Param('keyId') keyId: string,
    @TenantContext() tenantId: string,
  ): Promise<{ message: string }> {
    // Verify app ownership
    await this.appService.verifyAppOwnership(appId, tenantId);

    await this.apiKeyService.revoke(keyId, appId);
    return { message: 'API key revoked' };
  }

  @Delete(':keyId')
  @ApiOperation({
    summary: 'Delete an API key',
    description: 'Permanently deletes an API key. This action cannot be undone.',
  })
  async delete(
    @Param('appId') appId: string,
    @Param('keyId') keyId: string,
    @TenantContext() tenantId: string,
  ): Promise<{ message: string }> {
    // Verify app ownership
    await this.appService.verifyAppOwnership(appId, tenantId);

    await this.apiKeyService.delete(keyId, appId);
    return { message: 'API key deleted' };
  }
}
