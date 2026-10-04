import { Controller, Post, Get, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { EmailService } from '../services/email.service';
import { SendEmailDto, SendEmailResponseDto } from '../dtos/send-email.dto';
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantContext } from '../../auth/decorators/tenant-context.decorator';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('apiKey')
  @ApiOperation({
    summary: 'Send emails',
    description: `
      Send emails to one or multiple recipients using your API key.
      
      **Authentication**: Requires a valid API key in the X-API-Key header.
      
      **Pricing**: Emails are charged based on the system email price.
      
      **Wallet**: Sufficient balance must be available in your wallet.
      The total cost is reserved immediately and will be settled when emails are processed.
      
      **Email Provider**: Emails are sent via the configured email provider (Gmail, SMTP, etc.).
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Emails queued successfully',
    type: SendEmailResponseDto,
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
    description: 'Forbidden - App inactive',
  })
  async sendEmail(@Request() req: any, @Body() dto: SendEmailDto): Promise<SendEmailResponseDto> {
    const tenantId = req.tenantId; // Injected by ApiKeyGuard
    const appId = req.appId; // Injected by ApiKeyGuard
    return this.emailService.sendEmail(tenantId, appId, dto);
  }

  @Get('batches')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Get email batches for tenant',
    description: 'Retrieves email batches for the authenticated tenant across all apps, with pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email batches retrieved successfully',
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
    return this.emailService.getTenantEmailBatches(tenantId, pageNum, limitNum);
  }
}
