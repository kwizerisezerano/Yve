import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { WalletService } from '../../wallet/services/wallet.service';
import { AuditService } from '../../audit/services/audit.service';
import { SettingsService } from '../../settings/settings.service';
import { SendEmailDto, SendEmailResponseDto, EmailMessageDetail } from '../dtos/send-email.dto';
import axios from 'axios';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly relayApiUrl: string;
  private readonly relayApiKey: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly auditService: AuditService,
    private readonly settingsService: SettingsService,
  ) {
    // Notify Email Provider API configuration
    // In production with nginx proxy, use relative path or external URL
    const domain = process.env.DOMAIN || 'localhost';
    this.relayApiUrl = process.env.NOTIFY_API_URL || `https://${domain}/notify/api`;
    this.relayApiKey = process.env.NOTIFY_API_KEY || '';
  }

  /**
   * Send emails via API
   * - Calculates cost based on email pricing
   * - Checks wallet balance
   * - Charges wallet
   * - Sends to Relay backend
   * - Tracks status
   */
  async sendEmail(tenantId: string, appId: string, dto: SendEmailDto): Promise<SendEmailResponseDto> {
    this.logger.log(`[sendEmail] START tenantId=${tenantId} appId=${appId} recipients=${dto.to.length} from=${dto.from}`);
    
    try {
      // 1. Get email price from system settings
      const emailCost = await this.settingsService.getEmailPrice();

      // 2. Calculate total cost
      const totalCost = dto.to.length * emailCost;

      // 3. Check email wallet balance
      const wallet = await this.walletService.getBalance(tenantId);
      if (wallet.emailBalance < totalCost) {
        throw new BadRequestException(
          `Insufficient Email balance. Required: ${totalCost} RWF, Available: ${wallet.emailBalance} RWF`,
        );
      }

      // 4. Generate batch ID
      const batchId = this.generateBatchId();

      // 5. Charge wallet immediately
      try {
        await this.walletService.debit(tenantId, totalCost, batchId, 'EMAIL');
        this.logger.log(`Charged ${totalCost} RWF from Email wallet for batch ${batchId}`);
      } catch (error) {
        throw new BadRequestException('Failed to charge wallet. Please try again.');
      }

      // 6. Save EmailBatch to database
      const emailBatch = await this.prisma.emailBatch.create({
        data: {
          appId,
          batchId,
          totalEmails: dto.to.length,
          totalCost,
          status: 'QUEUED',
        },
      });

      // 7. Save individual emails to database
      const emails: EmailMessageDetail[] = [];
      
      for (const recipient of dto.to) {
        const savedEmail = await this.prisma.emailMessage.create({
          data: {
            batchId: emailBatch.id,
            to: recipient.email,
            from: dto.from,
            subject: dto.subject,
            body: dto.html,
            cost: emailCost,
            status: 'QUEUED',
          },
        });

        emails.push({
          id: savedEmail.id,
          to: savedEmail.to,
          from: savedEmail.from,
          subject: savedEmail.subject,
          cost: Number(savedEmail.cost),
          status: savedEmail.status,
        });
      }

      this.logger.log(`Saved email batch ${batchId} with ${emails.length} emails to database`);

      // 8. Create audit log for wallet debit
      await this.auditService.log(
        tenantId,
        'WALLET_DEBITED' as any,
        'EMAIL_BATCH',
        batchId,
        {
          batchId,
          appId,
          totalEmails: dto.to.length,
          totalCost,
          emailCost,
          from: dto.from,
        },
      );

      // 9. Send emails to Relay backend
      try {
        this.logger.log(`Sending email batch ${batchId} to Relay with ${dto.to.length} recipients`);
        
        const relayPayload = {
          from: dto.from,
          to: dto.to.map(r => r.email),
          subject: dto.subject,
          html: dto.html,
          text: dto.text,
          metadata: {
            batchId,
            appId,
            tenantId,
            ...dto.metadata,
          },
        };

        const relayResponse = await axios.post(
          `${this.relayApiUrl}/send`,
          relayPayload,
          {
            headers: {
              'Authorization': `Bearer ${this.relayApiKey}`,
              'Content-Type': 'application/json',
            },
          },
        );

        this.logger.log(`Relay response: ${JSON.stringify(relayResponse.data)}`);

        if (relayResponse.data.success) {
          // 10. Update batch status to SENT
          await this.prisma.emailBatch.update({
            where: { id: emailBatch.id },
            data: {
              status: 'SENT',
              relayBatchId: relayResponse.data.batchId,
              successCount: dto.to.length,
              updatedAt: new Date(),
            },
          });

          // 11. Update all emails in batch to SENT status
          await this.prisma.emailMessage.updateMany({
            where: { batchId: emailBatch.id },
            data: {
              status: 'SENT',
              providerId: relayResponse.data.messageId,
              updatedAt: new Date(),
            },
          });

          // 12. Update app's emailsSent counter
          await this.prisma.app.update({
            where: { id: appId },
            data: {
              emailsSent: { increment: dto.to.length },
              lastUsedAt: new Date(),
            },
          });

          // 13. Log successful send
          await this.auditService.log(
            tenantId,
            'EMAIL_SENT' as any,
            'EMAIL_BATCH',
            batchId,
            {
              batchId,
              appId,
              totalEmails: dto.to.length,
              totalCost,
              status: 'SENT',
              relayBatchId: relayResponse.data.batchId,
            },
          );

          this.logger.log(`Email batch ${batchId} sent successfully via Relay`);

          return {
            batchId,
            totalEmails: dto.to.length,
            totalCost,
            emailCost,
            status: 'SENT',
            emails: emails.map(e => ({ ...e, status: 'SENT' })),
          };
        } else {
          // 14. If Relay fails, update batch and emails to FAILED status
          this.logger.error(`Relay failed for email batch ${batchId}: ${relayResponse.data.error}`);
          
          await this.prisma.emailBatch.update({
            where: { id: emailBatch.id },
            data: {
              status: 'FAILED',
              failedCount: dto.to.length,
              updatedAt: new Date(),
            },
          });

          await this.prisma.emailMessage.updateMany({
            where: { batchId: emailBatch.id },
            data: {
              status: 'FAILED',
              errorMessage: relayResponse.data.error,
              failedAt: new Date(),
              updatedAt: new Date(),
            },
          });

          // 15. Refund the full amount since all emails failed
          await this.walletService.credit(
            tenantId, 
            totalCost, 
            `${batchId}_refund`,
            'EMAIL'
          );
          
          this.logger.log(`Refunded ${totalCost} RWF for failed email batch ${batchId}`);
          
          // Log failure and refund
          await this.auditService.log(
            tenantId,
            'EMAIL_FAILED' as any,
            'EMAIL_BATCH',
            batchId,
            {
              batchId,
              appId,
              totalEmails: dto.to.length,
              totalCost,
              refunded: totalCost,
              status: 'FAILED',
              error: relayResponse.data.error,
            },
          );

          throw new BadRequestException(
            `Failed to send email: ${relayResponse.data.error || 'Relay error'}. Amount refunded.`,
          );
        }
      } catch (error) {
        this.logger.error(`Error sending email batch ${batchId}:`, error);
        
        // Update batch and emails to FAILED status
        try {
          await this.prisma.emailBatch.update({
            where: { id: emailBatch.id },
            data: {
              status: 'FAILED',
              failedCount: dto.to.length,
              updatedAt: new Date(),
            },
          });

          await this.prisma.emailMessage.updateMany({
            where: { batchId: emailBatch.id },
            data: {
              status: 'FAILED',
              errorMessage: error instanceof Error ? error.message : 'Unknown error',
              failedAt: new Date(),
              updatedAt: new Date(),
            },
          });
        } catch (updateError) {
          this.logger.error(`Failed to update email status for batch ${batchId}:`, updateError);
        }

        // Refund the amount since emails failed
        try {
          await this.walletService.credit(
            tenantId, 
            totalCost, 
            `${batchId}_refund`,
            'EMAIL'
          );
          this.logger.log(`Refunded ${totalCost} RWF for failed email batch ${batchId}`);
        } catch (refundError) {
          this.logger.error(`Failed to refund for email batch ${batchId}:`, refundError);
        }

        throw error instanceof BadRequestException
          ? error
          : new BadRequestException(
              error instanceof Error 
                ? `Failed to send email: ${error.message}. Amount refunded.`
                : 'Failed to send email: Unknown error. Amount refunded.'
            );
      }
    } catch (error) {
      this.logger.error(`[sendEmail] ERROR:`, error);
      throw error;
    }
  }

  /**
   * Get email batches for an app with pagination
   */
  async getEmailBatches(
    appId: string, 
    page: number = 1, 
    limit: number = 50
  ): Promise<{ batches: any[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const total = await this.prisma.emailBatch.count({
      where: { appId },
    });

    const batches = await this.prisma.emailBatch.findMany({
      where: { appId },
      include: {
        emails: {
          select: {
            id: true,
            to: true,
            from: true,
            subject: true,
            cost: true,
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
        relayBatchId: batch.relayBatchId,
        appId: batch.appId,
        totalEmails: batch.totalEmails,
        successCount: batch.successCount,
        failedCount: batch.failedCount,
        totalCost: Number(batch.totalCost),
        status: batch.status,
        createdAt: batch.createdAt,
        updatedAt: batch.updatedAt,
        emails: batch.emails.map((email) => ({
          id: email.id,
          to: email.to,
          from: email.from,
          subject: email.subject,
          cost: Number(email.cost),
          status: email.status,
          createdAt: email.createdAt,
          errorMessage: email.errorMessage,
        })),
      })),
      total,
      page,
      totalPages,
    };
  }

  /**
   * Get email batches for a tenant (across all apps) with pagination
   */
  async getTenantEmailBatches(
    tenantId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{ batches: any[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const apps = await this.prisma.app.findMany({
      where: { tenantId },
      select: { id: true },
    });

    const appIds = apps.map(app => app.id);

    const total = await this.prisma.emailBatch.count({
      where: { appId: { in: appIds } },
    });

    const batches = await this.prisma.emailBatch.findMany({
      where: { appId: { in: appIds } },
      include: {
        app: {
          select: {
            id: true,
            name: true,
          },
        },
        emails: {
          select: {
            id: true,
            to: true,
            from: true,
            subject: true,
            cost: true,
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
        relayBatchId: batch.relayBatchId,
        appId: batch.appId,
        appName: batch.app.name,
        totalEmails: batch.totalEmails,
        successCount: batch.successCount,
        failedCount: batch.failedCount,
        totalCost: Number(batch.totalCost),
        status: batch.status,
        createdAt: batch.createdAt,
        updatedAt: batch.updatedAt,
        emails: batch.emails.map((email) => ({
          id: email.id,
          to: email.to,
          from: email.from,
          subject: email.subject,
          cost: Number(email.cost),
          status: email.status,
          createdAt: email.createdAt,
          errorMessage: email.errorMessage,
        })),
      })),
      total,
      page,
      totalPages,
    };
  }

  /**
   * Generate a unique batch ID
   */
  private generateBatchId(): string {
    return `email_batch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
