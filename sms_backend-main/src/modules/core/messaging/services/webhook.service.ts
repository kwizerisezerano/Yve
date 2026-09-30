import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { WebhookPayloadDto, MessageStatus, WebhookResponseDto } from '../dtos/webhook.dto';
import * as crypto from 'crypto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Process incoming webhook status updates from SMS provider
   */
  async processStatusUpdate(payload: WebhookPayloadDto): Promise<WebhookResponseDto> {
    const { batchId, messages } = payload;

    this.logger.log(`Processing webhook for batch ${batchId} with ${messages.length} message updates`);

    // 1. Find the message batch
    const messageBatch = await this.prisma.messageBatch.findUnique({
      where: { batchId },
      include: {
        app: {
          include: {
            tenant: true,
          },
        },
      },
    });

    if (!messageBatch) {
      this.logger.warn(`Batch ${batchId} not found for webhook`);
      throw new NotFoundException(`Batch ${batchId} not found`);
    }

    const tenantId = messageBatch.app.tenant.id;
    let updatedCount = 0;
    const updatedMessages: any[] = [];

    // 2. Process each message status update
    for (const messageUpdate of messages) {
      try {
        // Find message by provider ID or recipient
        const message = await this.prisma.message.findFirst({
          where: {
            batchId: messageBatch.id,
            OR: [
              { providerId: messageUpdate.messageId },
              { to: messageUpdate.recipient },
            ],
          },
        });

        if (!message) {
          this.logger.warn(
            `Message not found for providerId=${messageUpdate.messageId} or recipient=${messageUpdate.recipient}`,
          );
          continue;
        }

        // 3. Update message status
        const updateData: any = {
          status: messageUpdate.status,
          updatedAt: new Date(),
        };

        if (messageUpdate.status === MessageStatus.DELIVERED) {
          updateData.deliveredAt = messageUpdate.deliveredAt
            ? new Date(messageUpdate.deliveredAt)
            : new Date();
        }

        if (messageUpdate.status === MessageStatus.FAILED || messageUpdate.status === MessageStatus.UNDELIVERED) {
          updateData.failedAt = new Date();
          updateData.errorCode = messageUpdate.errorCode;
          updateData.errorMessage = messageUpdate.errorMessage;
        }

        const updatedMessage = await this.prisma.message.update({
          where: { id: message.id },
          data: updateData,
        });

        updatedCount++;
        updatedMessages.push(updatedMessage);

        this.logger.log(
          `Updated message ${message.id} to status ${messageUpdate.status} for recipient ${messageUpdate.recipient}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to update message for recipient ${messageUpdate.recipient}:`,
          error,
        );
      }
    }

    // 4. Update batch statistics
    const batchMessages = await this.prisma.message.findMany({
      where: { batchId: messageBatch.id },
      select: { status: true },
    });

    const successCount = batchMessages.filter(
      (m) => m.status === MessageStatus.DELIVERED || m.status === MessageStatus.SENT,
    ).length;

    const failedCount = batchMessages.filter(
      (m) => m.status === MessageStatus.FAILED || m.status === MessageStatus.UNDELIVERED,
    ).length;

    const allProcessed = batchMessages.every(
      (m) =>
        m.status === MessageStatus.DELIVERED ||
        m.status === MessageStatus.FAILED ||
        m.status === MessageStatus.UNDELIVERED,
    );

    await this.prisma.messageBatch.update({
      where: { id: messageBatch.id },
      data: {
        successCount,
        failedCount,
        status: allProcessed ? 'COMPLETED' : 'PROCESSING',
      },
    });

    // 5. Create audit log
    await this.auditService.log(
      tenantId,
      'MESSAGE_SENT' as any,
      'SMS_WEBHOOK',
      batchId,
      {
        batchId,
        messagesUpdated: updatedCount,
        successCount,
        failedCount,
        status: allProcessed ? 'COMPLETED' : 'PROCESSING',
      },
    );

    // 6. Forward webhook to user's application (if configured)
    if (messageBatch.app.webhookUrl && updatedMessages.length > 0) {
      this.forwardWebhookToUser(
        messageBatch.app.webhookUrl,
        messageBatch.app.webhookSecret,
        batchId,
        updatedMessages,
      ).catch((error) => {
        this.logger.error(`Failed to forward webhook to user's app:`, error);
      });
    }

    this.logger.log(
      `Webhook processed: batch=${batchId}, updated=${updatedCount}, success=${successCount}, failed=${failedCount}`,
    );

    return {
      success: true,
      messagesUpdated: updatedCount,
    };
  }

  /**
   * Forward webhook to user's application
   */
  private async forwardWebhookToUser(
    webhookUrl: string,
    webhookSecret: string | null,
    batchId: string,
    messages: any[],
  ): Promise<void> {
    try {
      const payload = {
        batchId,
        timestamp: new Date().toISOString(),
        messages: messages.map((msg) => ({
          id: msg.id,
          to: msg.to,
          from: msg.from,
          status: msg.status,
          deliveredAt: msg.deliveredAt,
          failedAt: msg.failedAt,
          errorCode: msg.errorCode,
          errorMessage: msg.errorMessage,
        })),
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'SMS-Gateway-Webhook/1.0',
      };

      // Add signature if secret is configured
      if (webhookSecret) {
        const signature = this.generateSignature(JSON.stringify(payload), webhookSecret);
        headers['X-Webhook-Signature'] = signature;
        headers['X-Webhook-Signature-Algorithm'] = 'sha256';
      }

      this.logger.log(`Forwarding webhook to user app: ${webhookUrl}`);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `User webhook returned ${response.status}: ${errorText}`,
        );
      } else {
        this.logger.log(`Successfully forwarded webhook to user app`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to forward webhook to user app: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Generate HMAC SHA256 signature for webhook payload
   */
  private generateSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Verify webhook signature (if provider sends one)
   * This is a placeholder - implement based on your provider's signature method
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  /**
   * Get webhook statistics for monitoring
   */
  async getWebhookStats(batchId: string) {
    const messageBatch = await this.prisma.messageBatch.findUnique({
      where: { batchId },
      include: {
        messages: {
          select: {
            status: true,
            deliveredAt: true,
            failedAt: true,
            errorCode: true,
          },
        },
      },
    });

    if (!messageBatch) {
      throw new NotFoundException(`Batch ${batchId} not found`);
    }

    return {
      batchId: messageBatch.batchId,
      status: messageBatch.status,
      totalMessages: messageBatch.totalMessages,
      successCount: messageBatch.successCount,
      failedCount: messageBatch.failedCount,
      pendingCount: messageBatch.totalMessages - messageBatch.successCount - messageBatch.failedCount,
      messages: messageBatch.messages,
    };
  }
}
