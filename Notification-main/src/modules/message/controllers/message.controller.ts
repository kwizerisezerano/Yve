import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ApiResponse } from '../../../shared/common/api-response';
import { ErrorResponseDto } from '../../../shared/common/error-response.dto';
import { CurrentAuth } from '../../auth/decorators/current-auth.decorator';
import type { AuthContext } from '../../auth/interfaces/auth-context.interface';
import { TenantAuthGuard } from '../../auth/guards/tenant-auth.guard';
import { CreateMessageResponseDto } from '../dtos/create-message-response.dto';
import { CreateMessageDto } from '../dtos/create-message.dto';
import { MessageListResponseDto, MessageResponseDto } from '../dtos/message-response.dto';
import { MessageSummaryDto } from '../dtos/message-summary.dto';
import { Message } from '../entities/message.entity';
import { MessageIntakeService } from '../services/message-intake.service';
import { MessageService } from '../services/message.service';

function toSummary(message: Message): MessageSummaryDto {
  return {
    id: message.id,
    sender: message.sender,
    recipient: message.recipient,
    body: message.body,
    type: message.type,
    status: message.status,
    provider: message.provider,
    idempotencyKey: message.idempotencyKey,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
  };
}

@ApiTags('messages')
@Controller('messages')
export class MessageController {
  constructor(
    private readonly intake: MessageIntakeService,
    private readonly messages: MessageService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Queue a message for one or more recipients.',
    description:
      'Authenticates the caller, validates the numbers and the message, enforces the idempotency ' +
      'key, creates one queued message per recipient, and returns the message ids at once.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.CREATED,
    description: 'Messages queued.',
    type: CreateMessageResponseDto,
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'The recipient, message, authentication, or idempotency key failed validation.',
    type: ErrorResponseDto,
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'The api key or token is missing, unknown, or disabled.',
    type: ErrorResponseDto,
  })
  @SwaggerApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'A request with this idempotency key has already been processed.',
    type: ErrorResponseDto,
  })
  async create(@Body() dto: CreateMessageDto, @Res() res: Response): Promise<void> {
    const ids = await this.intake.intake(dto);
    ApiResponse.success(res, 'Messages queued.', { ids }, HttpStatus.CREATED);
  }

  @Get()
  @UseGuards(TenantAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "List the authenticated tenant's messages.",
    description: 'Authenticate with Authorization: Bearer <api key>. Only ever returns your own messages.',
  })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Messages found.', type: MessageListResponseDto })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'The api key or token is missing, unknown, or disabled.',
    type: ErrorResponseDto,
  })
  async findAll(@CurrentAuth() auth: AuthContext, @Res() res: Response): Promise<void> {
    const messages = await this.messages.findByTenantId(auth.tenantId);
    ApiResponse.success(res, 'Messages found.', messages.map(toSummary), HttpStatus.OK);
  }

  @Get(':id')
  @UseGuards(TenantAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get one message by id.',
    description:
      'Authenticate with Authorization: Bearer <api key>. Returns not found for a message that ' +
      'exists but belongs to a different tenant.',
  })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Message found.', type: MessageResponseDto })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'The api key or token is missing, unknown, or disabled.',
    type: ErrorResponseDto,
  })
  @SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Message not found.', type: ErrorResponseDto })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentAuth() auth: AuthContext,
    @Res() res: Response,
  ): Promise<void> {
    const message = await this.messages.findByIdForTenant(id, auth.tenantId);
    ApiResponse.success(res, 'Message found.', toSummary(message), HttpStatus.OK);
  }
}
