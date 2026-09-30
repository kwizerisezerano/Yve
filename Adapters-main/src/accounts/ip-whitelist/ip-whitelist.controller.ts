import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { CreateWhitelistedIpDto } from '../dto/create-whitelisted-ip.dto';
import { WhitelistedIpEntity } from '../dto/whitelisted-ip.entity';
import { AdminOrOwnKeyGuard } from '../guards/admin-or-own-key.guard';
import { IpWhitelistService } from './ip-whitelist.service';

@ApiTags('ip-whitelist')
@ApiSecurity('admin-key')
@ApiSecurity('api-key')
@UseGuards(AdminOrOwnKeyGuard)
@Controller('accounts/:id/ip-whitelist')
export class IpWhitelistController {
  constructor(private readonly ipWhitelistService: IpWhitelistService) {}

  @Post()
  @ApiOperation({ summary: 'Add a whitelisted IP to an account' })
  @ApiParam({ name: 'id', description: 'Account UUID' })
  @ApiCreatedResponse({
    description: 'IP whitelisted.',
    type: WhitelistedIpEntity,
  })
  @ApiNotFoundResponse({ description: 'No account with this id.' })
  @ApiConflictResponse({
    description: 'This IP is already whitelisted for this account.',
  })
  create(
    @Param('id', ParseUUIDPipe) accountId: string,
    @Body() dto: CreateWhitelistedIpDto,
  ): Promise<WhitelistedIpEntity> {
    return this.ipWhitelistService.create(accountId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List whitelisted IPs for an account' })
  @ApiParam({ name: 'id', description: 'Account UUID' })
  @ApiOkResponse({
    description: 'List of whitelisted IPs.',
    type: [WhitelistedIpEntity],
  })
  @ApiNotFoundResponse({ description: 'No account with this id.' })
  findAll(
    @Param('id', ParseUUIDPipe) accountId: string,
  ): Promise<WhitelistedIpEntity[]> {
    return this.ipWhitelistService.findAll(accountId);
  }

  @Delete(':ipId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a whitelisted IP from an account' })
  @ApiParam({ name: 'id', description: 'Account UUID' })
  @ApiParam({ name: 'ipId', description: 'Whitelisted IP UUID' })
  @ApiNoContentResponse({ description: 'IP removed.' })
  @ApiNotFoundResponse({
    description: 'No whitelisted IP with this id for this account.',
  })
  remove(
    @Param('id', ParseUUIDPipe) accountId: string,
    @Param('ipId', ParseUUIDPipe) ipId: string,
  ): Promise<void> {
    return this.ipWhitelistService.remove(accountId, ipId);
  }
}
