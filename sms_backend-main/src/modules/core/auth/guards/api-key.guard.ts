import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import * as crypto from 'node:crypto';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../../../shared/redis/redis.module';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis | null,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest();
    const raw: string | undefined = request.headers['x-api-key'];
    if (!raw) throw new UnauthorizedException('API key required');

    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    const cacheKey = `apikey:${hash}`;

    // Try Redis cache first
    if (this.redis) {
      const cached = await this.redis.get(cacheKey).catch(() => null);
      if (cached) {
        const parsed = JSON.parse(cached) as { appId: string; tenantId: string; status: string; expiresAt: string | null };
        if (parsed.status !== 'ACTIVE') throw new UnauthorizedException('API key revoked');
        if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) throw new UnauthorizedException('API key expired');
        request.appId = parsed.appId;
        request.tenantId = parsed.tenantId;
        request.apiKeyId = parsed.appId; // Keep for backward compatibility
        return true;
      }
    }

    // Cache miss – hit database
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { keyHash: hash },
      include: {
        app: {
          select: {
            tenantId: true,
            status: true,
          },
        },
      },
    });

    if (!apiKey) throw new UnauthorizedException('Invalid API key');
    if (apiKey.status !== 'ACTIVE') throw new UnauthorizedException('API key revoked');
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) throw new UnauthorizedException('API key expired');
    if (apiKey.app.status !== 'ACTIVE') throw new UnauthorizedException('App is not active');

    // Warm cache (TTL 5 min)
    if (this.redis) {
      await this.redis
        .set(
          cacheKey,
          JSON.stringify({
            appId: apiKey.appId,
            tenantId: apiKey.app.tenantId,
            status: apiKey.status,
            expiresAt: apiKey.expiresAt,
          }),
          'EX',
          300,
        )
        .catch(() => {});
    }

    // Record last-used (fire and forget)
    this.prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } }).catch(() => {});

    request.appId = apiKey.appId;
    request.tenantId = apiKey.app.tenantId;
    request.apiKeyId = apiKey.id;
    return true;
  }
}
