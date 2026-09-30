import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

export interface RequestWithAccount extends Request {
  accountId: string;
}

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAccount>();
    const rawKey = request.headers['x-api-key'];

    if (!rawKey || typeof rawKey !== 'string') {
      throw new UnauthorizedException('Missing x-api-key header.');
    }

    const hashedKey = createHash('sha256').update(rawKey).digest('hex');
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { hashedKey },
      include: { account: true },
    });

    if (!apiKey || apiKey.revoked) {
      throw new UnauthorizedException('Invalid or revoked API key.');
    }

    if (apiKey.account.status === 'SUSPENDED') {
      throw new ForbiddenException('This account is suspended.');
    }

    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    request.accountId = apiKey.accountId;
    return true;
  }
}
