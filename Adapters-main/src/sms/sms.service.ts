import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, SmsMessage, SmsStatus } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CoreCallbackService } from './core-callback.service';
import { SendSmsDto } from './dto/send-sms.dto';
import { SendSmsResponseDto } from './dto/send-sms-response.dto';
import { SmsMessageStatusDto } from './dto/sms-message-status.dto';
import { OpcoClientService } from './opco-client.service';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly opcoClient: OpcoClientService,
    private readonly coreCallback: CoreCallbackService,
  ) {}

  async create(
    accountId: string,
    dto: SendSmsDto,
  ): Promise<SendSmsResponseDto> {
    let record: SmsMessage;

    try {
      record = await this.prisma.smsMessage.create({
        data: {
          accountId,
          coreMessageId: dto.message_id,
          msisdn: dto.msisdn,
          message: dto.message,
          senderId: dto.sender_id,
          coreCallbackUrl: dto.callback_url,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        // Same account + message_id as before — return the existing result
        // instead of sending the SMS again.
        const existing = await this.prisma.smsMessage.findUniqueOrThrow({
          where: {
            accountId_coreMessageId: {
              accountId,
              coreMessageId: dto.message_id,
            },
          },
        });

        return this.toSendResponse(existing);
      }

      throw error;
    }

    // Ack Core immediately — don't make them wait on OPCO's response.
    void this.dispatchToOpco(record.id).catch((error: unknown) => {
      this.logger.error(
        `Unhandled error dispatching ${record.id} to OPCO`,
        error instanceof Error ? error.stack : String(error),
      );
    });

    return this.toSendResponse(record);
  }

  async findOne(
    accountId: string,
    adapterId: string,
  ): Promise<SmsMessageStatusDto> {
    const record = await this.prisma.smsMessage.findUnique({
      where: { id: adapterId },
    });

    if (!record || record.accountId !== accountId) {
      throw new NotFoundException(`Message ${adapterId} not found.`);
    }

    return {
      adapterId: record.id,
      messageId: record.coreMessageId,
      status: record.status,
      msisdn: record.msisdn,
      opcoReference: record.opcoReference,
      failureReason: record.failureReason,
      deliveredAt: record.deliveredAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private async dispatchToOpco(adapterId: string): Promise<void> {
    const record = await this.prisma.smsMessage.findUniqueOrThrow({
      where: { id: adapterId },
    });

    try {
      const response = await this.opcoClient.sendSms({
        message: record.message,
        to: record.msisdn,
        sender_id: record.senderId,
        bypass_optout: true,
        callback_url: this.buildOpcoCallbackUrl(record.id),
      });

      await this.prisma.smsMessage.update({
        where: { id: record.id },
        data: {
          status: SmsStatus.SENT_TO_OPCO,
          opcoReference:
            typeof response.message_id === 'string'
              ? response.message_id
              : null,
          opcoResponse: response as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to dispatch ${record.id} to OPCO`,
        error instanceof Error ? error.stack : String(error),
      );

      // We never reached OPCO, so no callback will ever arrive for this
      // message — this is a final outcome, tell Core now rather than
      // leaving them waiting on a callback that isn't coming.
      const updated = await this.prisma.smsMessage.update({
        where: { id: record.id },
        data: {
          status: SmsStatus.FAILED,
          failureReason:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });

      await this.forwardStatusToCore(updated);
    }
  }

  private async forwardStatusToCore(record: SmsMessage): Promise<void> {
    if (
      record.status !== SmsStatus.DELIVERED &&
      record.status !== SmsStatus.FAILED
    ) {
      return;
    }

    const result = await this.coreCallback.notify(record.coreCallbackUrl, {
      adapter_id: record.id,
      message_id: record.coreMessageId,
      status: record.status,
      delivered_at: record.deliveredAt?.toISOString(),
      error: record.failureReason ?? undefined,
    });

    await this.prisma.smsMessage.update({
      where: { id: record.id },
      data: result.ok
        ? { coreCallbackSentAt: new Date(), coreCallbackError: null }
        : { coreCallbackError: result.error },
    });
  }

  private buildOpcoCallbackUrl(adapterId: string): string {
    const base = process.env.ADAPTER_BASE_URL;

    if (!base) {
      throw new Error('ADAPTER_BASE_URL is not configured.');
    }

    return `${base.replace(/\/$/, '')}/api/v1/callback/opco/${adapterId}`;
  }

  private toSendResponse(record: SmsMessage): SendSmsResponseDto {
    return {
      adapterId: record.id,
      messageId: record.coreMessageId,
      status: record.status,
      createdAt: record.createdAt,
    };
  }
}
