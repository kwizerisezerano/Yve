import { Controller, Post, Body, Get, Param, UseGuards, Logger, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WebhookService } from '../services/webhook.service';
import { WebhookPayloadDto, WebhookResponseDto } from '../dtos/webhook.dto';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  @Post('sms/status')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Receive SMS delivery status updates',
    description: `
      Webhook endpoint for SMS provider to send delivery status updates.
      
      **Expected Payload Format:**
      \`\`\`json
      {
        "batchId": "batch_1234567890_abc123",
        "messages": [
          {
            "messageId": "msg_xyz123",
            "recipient": "+250783503691",
            "status": "DELIVERED",
            "deliveredAt": "2026-08-27T12:00:00Z"
          },
          {
            "messageId": "msg_xyz124",
            "recipient": "+250733503693",
            "status": "FAILED",
            "errorCode": "INVALID_NUMBER",
            "errorMessage": "Invalid phone number format"
          }
        ]
      }
      \`\`\`
      
      **Possible Statuses:**
      - QUEUED: Message queued for sending
      - SENT: Message sent to provider
      - DELIVERED: Message delivered to recipient
      - FAILED: Message failed to send
      - UNDELIVERED: Message sent but not delivered
      
      **Security:**
      - This endpoint should be secured with IP whitelisting at infrastructure level
      - Consider implementing signature verification for production
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
    type: WebhookResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Batch not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook payload',
  })
  async handleStatusUpdate(@Body() payload: WebhookPayloadDto): Promise<WebhookResponseDto> {
    this.logger.log(`Received webhook for batch ${payload.batchId}`);
    
    // Optional: Verify webhook signature
    // if (payload.signature) {
    //   const isValid = this.webhookService.verifySignature(
    //     JSON.stringify(payload),
    //     payload.signature,
    //     process.env.WEBHOOK_SECRET || '',
    //   );
    //   if (!isValid) {
    //     throw new UnauthorizedException('Invalid webhook signature');
    //   }
    // }

    return this.webhookService.processStatusUpdate(payload);
  }

  @Get('sms/status/:batchId')
  @ApiOperation({
    summary: 'Get batch status and statistics',
    description: 'Retrieve current status and delivery statistics for a message batch',
  })
  @ApiResponse({
    status: 200,
    description: 'Batch statistics retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Batch not found',
  })
  async getBatchStatus(@Param('batchId') batchId: string) {
    return this.webhookService.getWebhookStats(batchId);
  }
}
