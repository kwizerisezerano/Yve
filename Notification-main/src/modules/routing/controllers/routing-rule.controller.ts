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
import { ProviderService } from '../../provider/services/provider.service';
import { CreateRoutingRuleDto } from '../dtos/create-routing-rule.dto';
import {
  RoutingRuleListResponseDto,
  RoutingRuleResponseDto,
} from '../dtos/routing-rule-response.dto';
import { RoutingRuleSummaryDto } from '../dtos/routing-rule-summary.dto';
import { UpdateRoutingRuleDto } from '../dtos/update-routing-rule.dto';
import { RoutingRule } from '../entities/routing-rule.entity';
import { RoutingRuleService } from '../services/routing-rule.service';

function toSummary(rule: RoutingRule, providerName: string): RoutingRuleSummaryDto {
  return {
    id: rule.id,
    country: rule.country,
    operator: rule.operator,
    type: rule.type,
    providerId: rule.providerId,
    providerName,
    action: rule.action,
    priority: rule.priority,
    cost: rule.cost,
    status: rule.status,
    createdAt: rule.createdAt.toISOString(),
    updatedAt: rule.updatedAt.toISOString(),
  };
}

@ApiTags('routing-rules')
@Controller('routing-rules')
export class RoutingRuleController {
  constructor(
    private readonly rules: RoutingRuleService,
    private readonly providers: ProviderService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a routing rule.',
    description:
      'Country, operator, and type are each optional, omitting one means any. Provider id must ' +
      'name a registered provider (see POST /providers). Operator specific rules will not match ' +
      'any message today, no operator lookup exists yet.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.CREATED,
    description: 'Routing rule created.',
    type: RoutingRuleResponseDto,
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'The rule failed validation.',
    type: ErrorResponseDto,
  })
  async create(@Body() dto: CreateRoutingRuleDto, @Res() res: Response): Promise<void> {
    const rule = await this.rules.create(dto);
    const provider = await this.providers.findById(rule.providerId);
    ApiResponse.success(res, 'Routing rule created.', toSummary(rule, provider.name), HttpStatus.CREATED);
  }

  @Get()
  @ApiOperation({ summary: 'List routing rules.' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Routing rules found.',
    type: RoutingRuleListResponseDto,
  })
  async findAll(@Res() res: Response): Promise<void> {
    const rules = await this.rules.findAll();
    const providers = await this.providers.findByIds([...new Set(rules.map((rule) => rule.providerId))]);
    const nameById = new Map(providers.map((provider) => [provider.id, provider.name]));
    ApiResponse.success(
      res,
      'Routing rules found.',
      rules.map((rule) => toSummary(rule, nameById.get(rule.providerId) ?? rule.providerId)),
      HttpStatus.OK,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one routing rule by id.' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Routing rule found.',
    type: RoutingRuleResponseDto,
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Routing rule not found.',
    type: ErrorResponseDto,
  })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string, @Res() res: Response): Promise<void> {
    const rule = await this.rules.findById(id);
    const provider = await this.providers.findById(rule.providerId);
    ApiResponse.success(res, 'Routing rule found.', toSummary(rule, provider.name), HttpStatus.OK);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a routing rule. Set status to disabled to stop it being considered.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Routing rule updated.',
    type: RoutingRuleResponseDto,
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Routing rule not found.',
    type: ErrorResponseDto,
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateRoutingRuleDto,
    @Res() res: Response,
  ): Promise<void> {
    const rule = await this.rules.update(id, dto);
    const provider = await this.providers.findById(rule.providerId);
    ApiResponse.success(res, 'Routing rule updated.', toSummary(rule, provider.name), HttpStatus.OK);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a routing rule.' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Routing rule deleted.' })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Routing rule not found.',
    type: ErrorResponseDto,
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string, @Res() res: Response): Promise<void> {
    await this.rules.delete(id);
    ApiResponse.success(res, 'Routing rule deleted.', null, HttpStatus.OK);
  }
}
