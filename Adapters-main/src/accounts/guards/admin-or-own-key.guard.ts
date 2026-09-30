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

@Injectable()
export class AdminOrOwnKeyGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const adminKey = request.headers['x-admin-key'];

    if (adminKey && adminKey === process.env.ADMIN_API_KEY) {
      return true;
    }

    const rawKey = request.headers['x-api-key'];

    if (!rawKey || typeof rawKey !== 'string') {
      throw new UnauthorizedException(
        'Provide an x-admin-key or x-api-key header.',
      );
    }

    const hashedKey = createHash('sha256').update(rawKey).digest('hex');
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { hashedKey },
    });

    if (!apiKey || apiKey.revoked) {
      throw new UnauthorizedException('Invalid or revoked API key.');
    }

    if (apiKey.accountId !== request.params.id) {
      throw new ForbiddenException(
        'This API key does not belong to this account.',
      );
    }

    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    return true;
  }
}
