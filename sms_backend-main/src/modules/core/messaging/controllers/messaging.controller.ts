import { Controller, Post, Get, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { MessagingService } from '../services/messaging.service';
import { SendSmsDto, SendSmsResponseDto } from '../dtos/send-sms.dto';
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantContext } from '../../auth/decorators/tenant-context.decorator';

@ApiTags('Messaging')
@Controller('sms')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('send')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('apiKey')
  @ApiOperation({
    summary: 'Send SMS messages',
    description: `
      Send SMS messages to one or multiple recipients using your API key.
      
      **Authentication**: Requires a valid API key in the X-API-Key header.
      
      **Pricing**: Messages are charged based on the system SMS price. 
      Long messages are automatically split into multiple SMS segments:
      - Standard SMS: up to 160 characters
      - Unicode SMS: up to 70 characters
      - Multi-part messages are split into 153 (standard) or 67 (unicode) character segments
      
      **Wallet**: Sufficient balance must be available in your wallet. 
      The total cost is reserved immediately and will be settled when messages are processed.
      
      **Sender ID**: If provided, must be an approved sender ID for your account.
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Messages queued successfully',
    type: SendSmsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input or insufficient balance',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing API key',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Sender ID not approved or app inactive',
  })
  async sendSms(@Request() req: any, @Body() dto: SendSmsDto): Promise<SendSmsResponseDto> {
    const tenantId = req.tenantId; // Injected by ApiKeyGuard
    const appId = req.appId; // Injected by ApiKeyGuard
    return this.messagingService.sendSms(tenantId, appId, dto);
  }

  @Get('batches')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Get message batches for tenant',
    description: 'Retrieves message batches for the authenticated tenant across all apps, with pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Message batches retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getTenantBatches(
    @TenantContext() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.messagingService.getTenantMessageBatches(tenantId, pageNum, limitNum);
  }
}
