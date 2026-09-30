import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWhitelistedIpDto } from '../dto/create-whitelisted-ip.dto';
import { WhitelistedIpEntity } from '../dto/whitelisted-ip.entity';

const WHITELISTED_IP_SELECT = {
  id: true,
  ipAddress: true,
  description: true,
  createdAt: true,
} as const;

@Injectable()
export class IpWhitelistService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    accountId: string,
    dto: CreateWhitelistedIpDto,
  ): Promise<WhitelistedIpEntity> {
    await this.ensureAccountExists(accountId);

    try {
      return await this.prisma.whitelistedIp.create({
        data: { accountId, ...dto },
        select: WHITELISTED_IP_SELECT,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'This IP address is already whitelisted for this account.',
        );
      }

      throw error;
    }
  }

  async findAll(accountId: string): Promise<WhitelistedIpEntity[]> {
    await this.ensureAccountExists(accountId);

    return this.prisma.whitelistedIp.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
      select: WHITELISTED_IP_SELECT,
    });
  }

  async remove(accountId: string, ipId: string): Promise<void> {
    const record = await this.prisma.whitelistedIp.findUnique({
      where: { id: ipId },
    });

    if (!record || record.accountId !== accountId) {
      throw new NotFoundException(
        `Whitelisted IP ${ipId} not found for this account.`,
      );
    }

    await this.prisma.whitelistedIp.delete({ where: { id: ipId } });
  }

  private async ensureAccountExists(accountId: string): Promise<void> {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: { id: true },
    });

    if (!account) {
      throw new NotFoundException(`Account ${accountId} not found.`);
    }
  }
}
