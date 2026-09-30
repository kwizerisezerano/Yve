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
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse as SwaggerApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ApiResponse } from '../../../shared/common/api-response';
import { ErrorResponseDto } from '../../../shared/common/error-response.dto';
import { CreateProviderDto } from '../dtos/create-provider.dto';
import { ProviderListResponseDto, ProviderResponseDto } from '../dtos/provider-response.dto';
import { ProviderSummaryDto } from '../dtos/provider-summary.dto';
import { UpdateProviderDto } from '../dtos/update-provider.dto';
import { Provider } from '../entities/provider.entity';
import { ProviderService } from '../services/provider.service';

function toSummary(provider: Provider): ProviderSummaryDto {
  return {
    id: provider.id,
    name: provider.name,
    description: provider.description,
    defaultCost: provider.defaultCost,
    status: provider.status,
    createdAt: provider.createdAt.toISOString(),
    updatedAt: provider.updatedAt.toISOString(),
  };
}

@ApiTags('providers')
@Controller('providers')
export class ProviderController {
  constructor(private readonly providers: ProviderService) {}

  @Post()
  @ApiOperation({
    summary: 'Register a provider.',
    description:
      'Name is the identifier routing rules reference and the same name Adapters is asked ' +
      'about for health. Default cost is a fallback used when a matching routing rule does ' +
      'not set its own cost.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.CREATED,
    description: 'Provider registered.',
    type: ProviderResponseDto,
  })
  @SwaggerApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'A provider with this name already exists.',
    type: ErrorResponseDto,
  })
  async create(@Body() dto: CreateProviderDto, @Res() res: Response): Promise<void> {
    const provider = await this.providers.create(dto);
    ApiResponse.success(res, 'Provider registered.', toSummary(provider), HttpStatus.CREATED);
  }

  @Get()
  @ApiOperation({ summary: 'List providers.' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Providers found.',
    type: ProviderListResponseDto,
  })
  async findAll(@Res() res: Response): Promise<void> {
    const providers = await this.providers.findAll();
    ApiResponse.success(res, 'Providers found.', providers.map(toSummary), HttpStatus.OK);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one provider by id.' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Provider found.', type: ProviderResponseDto })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Provider not found.',
    type: ErrorResponseDto,
  })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string, @Res() res: Response): Promise<void> {
    const provider = await this.providers.findById(id);
    ApiResponse.success(res, 'Provider found.', toSummary(provider), HttpStatus.OK);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a provider. Set status to disabled to pull it out of routing without touching its rules.',
  })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Provider updated.', type: ProviderResponseDto })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Provider not found.',
    type: ErrorResponseDto,
  })
  @SwaggerApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'A provider with this name already exists.',
    type: ErrorResponseDto,
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProviderDto,
    @Res() res: Response,
  ): Promise<void> {
    const provider = await this.providers.update(id, dto);
    ApiResponse.success(res, 'Provider updated.', toSummary(provider), HttpStatus.OK);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a provider.',
    description: 'Fails with a conflict if any routing rule still references it.',
  })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Provider deleted.' })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Provider not found.',
    type: ErrorResponseDto,
  })
  @SwaggerApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'The provider is still referenced by a routing rule.',
    type: ErrorResponseDto,
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string, @Res() res: Response): Promise<void> {
    await this.providers.delete(id);
    ApiResponse.success(res, 'Provider deleted.', null, HttpStatus.OK);
  }
}
