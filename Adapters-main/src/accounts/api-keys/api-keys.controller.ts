import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ApiKeyEntity } from '../dto/api-key.entity';
import { CreateApiKeyResponseDto } from '../dto/create-api-key-response.dto';
import { AdminGuard } from '../guards/admin.guard';
import { ApiKeysService } from './api-keys.service';

@ApiTags('api-keys')
@ApiSecurity('admin-key')
@UseGuards(AdminGuard)
@Controller('accounts/:id/api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate a new API key for an account',
    description:
      'Existing keys are left untouched — this only adds a new active key. ' +
      'Revoke old ones separately via DELETE /accounts/:id/api-keys/:keyId.',
  })
  @ApiParam({ name: 'id', description: 'Account UUID' })
  @ApiCreatedResponse({
    description: 'API key created. The raw key is returned only once.',
    type: CreateApiKeyResponseDto,
  })
  @ApiNotFoundResponse({ description: 'No account with this id.' })
  create(
    @Param('id', ParseUUIDPipe) accountId: string,
  ): Promise<CreateApiKeyResponseDto> {
    return this.apiKeysService.create(accountId);
  }

  @Delete(':keyId')
  @ApiOperation({ summary: 'Revoke a specific API key' })
  @ApiParam({ name: 'id', description: 'Account UUID' })
  @ApiParam({ name: 'keyId', description: 'API key UUID' })
  @ApiOkResponse({ description: 'API key revoked.', type: ApiKeyEntity })
  @ApiNotFoundResponse({
    description: 'No API key with this id for this account.',
  })
  revoke(
    @Param('id', ParseUUIDPipe) accountId: string,
    @Param('keyId', ParseUUIDPipe) keyId: string,
  ): Promise<ApiKeyEntity> {
    return this.apiKeysService.revoke(accountId, keyId);
  }
}
