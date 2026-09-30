import { Injectable, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { WalletService } from '../../wallet/services/wallet.service';
import { AuditService } from '../../audit/services/audit.service';
import { SettingsService } from '../../settings/settings.service';
import { SmsProviderService } from './sms-provider.service';
import { SendSmsDto, SendSmsResponseDto, MessageDetail } from '../dtos/send-sms.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly auditService: AuditService,
    private readonly settingsService: SettingsService,
    private readonly smsProviderService: SmsProviderService,
  ) {}

  /**
   * Send SMS messages via API
   * - Validates sender ID
   * - Calculates cost based on system SMS price
   * - Reserves wallet balance
   * - Queues messages for processing
   */
  async sendSms(tenantId: string, appId: string, dto: SendSmsDto): Promise<SendSmsResponseDto> {
    this.logger.log(`[sendSms] START tenantId=${tenantId} appId=${appId} recipients=${dto.to} from=${dto.from}`);
    try {
    // 1. Get SMS price from system settings
    const smsCost = await this.settingsService.getSmsPrice();

    // 2. Validate sender ID - now required
    if (!dto.from || dto.from.trim() === '') {
      throw new BadRequestException(
        'Sender ID is required. Please provide a valid sender ID.',
      );
    }

    const senderIdValid = await this.validateSenderId(tenantId, dto.from);
    if (!senderIdValid) {
      throw new ForbiddenException(
        `Sender ID "${dto.from}" is not approved for your account. Please register and get approval first.`,
      );
    }

    // 3. Calculate total cost
    const messageDetails = dto.to.map((phoneNumber) => {
      const smsCount = this.calculateSmsCount(dto.message);
      const cost = smsCount * smsCost;

      return {
        phoneNumber,
        smsCount,
        cost,
      };
    });

    const totalCost = messageDetails.reduce((sum, detail) => sum + detail.cost, 0);
    const totalSmsCount = messageDetails.reduce((sum, detail) => sum + detail.smsCount, 0);

    // 4. Check wallet balance before deducting
    const wallet = await this.walletService.getBalance(tenantId);
    if (wallet.balance < totalCost) {
      throw new BadRequestException(
        `Insufficient balance. Required: ${totalCost} RWF, Available: ${wallet.balance} RWF`,
      );
    }

    // 5. Create batch ID for tracking
    const batchId = this.generateBatchId();

    // 6. Deduct balance immediately when client sends message
    try {
      await this.walletService.debit(tenantId, totalCost, batchId);
      this.logger.log(`Deducted ${totalCost} RWF from wallet for batch ${batchId}`);
    } catch (error) {
      throw new BadRequestException('Failed to deduct wallet balance. Please try again.');
    }

    // 7. Save MessageBatch and Messages to database immediately with QUEUED status
    const messageBatch = await this.prisma.messageBatch.create({
      data: {
        appId,
        batchId,
        totalMessages: dto.to.length,
        totalCost,
        status: 'QUEUED',
        webhookUrl: null, // Will be populated from app settings if needed
      },
    });

    // Save individual messages to database
    const messages: MessageDetail[] = [];
    
    for (let i = 0; i < dto.to.length; i++) {
      const phoneNumber = dto.to[i];
      const detail = messageDetails[i];

      // Create message in database
      const savedMessage = await this.prisma.message.create({
        data: {
          batchId: messageBatch.id,
          to: phoneNumber,
          from: dto.from,
          message: dto.message,
          cost: detail.cost,
          smsCount: detail.smsCount,
          status: 'QUEUED',
        },
      });

      messages.push({
        id: savedMessage.id,
        to: savedMessage.to,
        from: savedMessage.from,
        message: savedMessage.message,
        cost: Number(savedMessage.cost),
        smsCount: savedMessage.smsCount,
        status: savedMessage.status,
      });
    }

    this.logger.log(`Saved batch ${batchId} with ${messages.length} messages to database`);

    // 8. Create audit log for wallet debit
    await this.auditService.log(
      tenantId,
      'WALLET_DEBITED' as any,
      'SMS_BATCH',
      batchId,
      {
        batchId,
        appId,
        totalMessages: dto.to.length,
        totalSmsCount,
        totalCost,
        smsCost,
        from: dto.from,
      },
    );

    // 9. Send SMS via external provider microservice
    const senderName = dto.from;
    
    try {
      this.logger.log(`Sending batch ${batchId} to provider with ${dto.to.length} recipients`);
      
      const providerResponse = await this.smsProviderService.sendBatchSms(
        dto.to,
        dto.message,
        senderName,
        batchId,
      );

      this.logger.log(`Provider response: ${JSON.stringify(providerResponse)}`);

      if (providerResponse.success) {
        // 10. Update batch status to SENT
        await this.prisma.messageBatch.update({
          where: { id: messageBatch.id },
          data: {
            status: 'SENT',
            successCount: dto.to.length,
            updatedAt: new Date(),
          },
        });

        // 11. Update all messages in batch to SENT status
        await this.prisma.message.updateMany({
          where: { batchId: messageBatch.id },
          data: {
            status: 'SENT',
            providerId: providerResponse.messageId,
            updatedAt: new Date(),
          },
        });
        
        // 12. Update app's messagesSent counter
        await this.prisma.app.update({
          where: { id: appId },
          data: {
            messagesSent: { increment: dto.to.length },
            lastUsedAt: new Date(),
          },
        });
        
        // 13. Log successful send
        await this.auditService.log(
          tenantId,
          'MESSAGE_SENT' as any,
          'SMS_BATCH',
          batchId,
          {
            batchId,
            appId,
            totalMessages: dto.to.length,
            totalCost,
            status: 'SENT',
            providerId: providerResponse.messageId,
          },
        );

        this.logger.log(`Batch ${batchId} sent successfully`);

        return {
          batchId,
          totalMessages: dto.to.length,
          totalCost,
          smsCost,
          status: 'SENT',
          messages: messages.map(m => ({ ...m, status: 'SENT' })),
        };
      } else {
        // 14. If provider fails, update batch and messages to FAILED status
        this.logger.error(`Provider failed for batch ${batchId}: ${providerResponse.error}`);
        
        await this.prisma.messageBatch.update({
          where: { id: messageBatch.id },
          data: {
            status: 'FAILED',
            failedCount: dto.to.length,
            updatedAt: new Date(),
          },
        });

        await this.prisma.message.updateMany({
          where: { batchId: messageBatch.id },
          data: {
            status: 'FAILED',
            errorMessage: providerResponse.error,
            failedAt: new Date(),
            updatedAt: new Date(),
          },
        });

        // 15. Refund the full amount since all messages failed
        await this.walletService.credit(
          tenantId, 
          totalCost, 
          `${batchId}_refund`
        );
        
        this.logger.log(`Refunded ${totalCost} RWF for failed batch ${batchId}`);
        
        // Log failure and refund
        await this.auditService.log(
          tenantId,
          'MESSAGE_FAILED' as any,
          'SMS_BATCH',
          batchId,
          {
            batchId,
            appId,
            totalMessages: dto.to.length,
            totalCost,
            refunded: totalCost,
            status: 'FAILED',
            error: providerResponse.error,
          },
        );

        throw new BadRequestException(
          `Failed to send SMS: ${providerResponse.error || 'Provider error'}. Amount refunded.`,
        );
      }
    } catch (error) {
      this.logger.error(`Error sending batch ${batchId}:`, error);
      
      // Update batch and messages to FAILED status
      try {
        await this.prisma.messageBatch.update({
          where: { id: messageBatch.id },
          data: {
            status: 'FAILED',
            failedCount: dto.to.length,
            updatedAt: new Date(),
          },
        });

        await this.prisma.message.updateMany({
          where: { batchId: messageBatch.id },
          data: {
            status: 'FAILED',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            failedAt: new Date(),
            updatedAt: new Date(),
          },
        });
      } catch (updateError) {
        this.logger.error(`Failed to update message status for batch ${batchId}:`, updateError);
      }

      // Refund the amount since messages failed
      try {
        await this.walletService.credit(
          tenantId, 
          totalCost, 
          `${batchId}_refund`
        );
        this.logger.log(`Refunded ${totalCost} RWF for failed batch ${batchId}`);
      } catch (refundError) {
        this.logger.error(`Failed to refund for batch ${batchId}:`, refundError);
      }

      throw error instanceof BadRequestException
        ? error
        : new BadRequestException(
            error instanceof Error 
              ? `Failed to send SMS: ${error.message}. Amount refunded.`
              : 'Failed to send SMS: Unknown error. Amount refunded.'
          );
    }
    } catch (topLevelErr: unknown) {
      const errStr = `[sendSms] UNCAUGHT ERROR: ${topLevelErr instanceof Error ? topLevelErr.message : String(topLevelErr)}\nStack: ${topLevelErr instanceof Error ? topLevelErr.stack : 'No stack'}\n`;
      try {
        fs.writeFileSync(path.join(__dirname, '../../../../error_trace.log'), errStr);
      } catch (logErr) {
        // ignore
      }
      this.logger.error(`[sendSms] UNCAUGHT ERROR: ${topLevelErr instanceof Error ? topLevelErr.message : String(topLevelErr)}`, topLevelErr instanceof Error ? topLevelErr.stack : undefined);
      throw topLevelErr;
    }
  }

  /**
   * Validate that the sender ID is approved for this tenant
   */
  private async validateSenderId(tenantId: string, senderName: string): Promise<boolean> {
    const senderId = await this.prisma.senderID.findFirst({
      where: {
        tenantId,
        name: senderName,
        status: 'APPROVED',
      },
    });

    return !!senderId;
  }

  /**
   * Calculate how many SMS segments are needed for a message
   * - Single SMS: up to 160 characters (GSM-7) or 70 characters (UCS-2/Unicode)
   * - Multi-part SMS: 153 characters per segment (GSM-7) or 67 characters (UCS-2)
   */
  private calculateSmsCount(message: string): number {
    // Check if message contains non-GSM characters (Unicode)
    const isUnicode = /[^\x00-\x7F]/.test(message);

    if (isUnicode) {
      // Unicode message
      if (message.length <= 70) return 1;
      return Math.ceil(message.length / 67);
    } else {
      // GSM-7 message
      if (message.length <= 160) return 1;
      return Math.ceil(message.length / 153);
    }
  }

  /**
   * Generate a unique batch ID
   */
  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Generate a unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Get message batches for an app with pagination
   */
  async getMessageBatches(
    appId: string, 
    page: number = 1, 
    limit: number = 50
  ): Promise<{ batches: any[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    // Count total batches for this app
    const total = await this.prisma.messageBatch.count({
      where: { appId },
    });

    const batches = await this.prisma.messageBatch.findMany({
      where: { appId },
      include: {
        messages: {
          select: {
            id: true,
            to: true,
            from: true,
            message: true,
            cost: true,
            smsCount: true,
            status: true,
            createdAt: true,
            errorMessage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      batches: batches.map((batch) => ({
        id: batch.id,
        batchId: batch.batchId,
        appId: batch.appId,
        totalMessages: batch.totalMessages,
        successCount: batch.successCount,
        failedCount: batch.failedCount,
        totalCost: Number(batch.totalCost),
        status: batch.status,
        createdAt: batch.createdAt,
        updatedAt: batch.updatedAt,
        messages: batch.messages.map((msg) => ({
          id: msg.id,
          to: msg.to,
          from: msg.from,
          message: msg.message,
          cost: Number(msg.cost),
          smsCount: msg.smsCount,
          status: msg.status,
          createdAt: msg.createdAt,
          errorMessage: msg.errorMessage,
        })),
      })),
      total,
      page,
      totalPages,
    };
  }

  /**
   * Get message batches for a tenant (across all apps) with pagination
   */
  async getTenantMessageBatches(
    tenantId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{ batches: any[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    // Get all apps for the tenant
    const apps = await this.prisma.app.findMany({
      where: { tenantId },
      select: { id: true },
    });

    const appIds = apps.map(app => app.id);

    // Count total batches
    const total = await this.prisma.messageBatch.count({
      where: { appId: { in: appIds } },
    });

    // Get batches with pagination
    const batches = await this.prisma.messageBatch.findMany({
      where: { appId: { in: appIds } },
      include: {
        app: {
          select: {
            id: true,
            name: true,
          },
        },
        messages: {
          select: {
            id: true,
            to: true,
            from: true,
            message: true,
            cost: true,
            smsCount: true,
            status: true,
            createdAt: true,
            errorMessage: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      batches: batches.map((batch) => ({
        id: batch.id,
        batchId: batch.batchId,
        appId: batch.appId,
        appName: batch.app.name,
        totalMessages: batch.totalMessages,
        successCount: batch.successCount,
        failedCount: batch.failedCount,
        totalCost: Number(batch.totalCost),
        status: batch.status,
        createdAt: batch.createdAt,
        updatedAt: batch.updatedAt,
        messages: batch.messages.map((msg) => ({
          id: msg.id,
          to: msg.to,
          from: msg.from,
          message: msg.message,
          cost: Number(msg.cost),
          smsCount: msg.smsCount,
          status: msg.status,
          createdAt: msg.createdAt,
          errorMessage: msg.errorMessage,
        })),
      })),
      total,
      page,
      totalPages,
    };
  }
}
