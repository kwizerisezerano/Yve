import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithAccount } from '../guards/api-key.guard';

export const CurrentAccountId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithAccount>();
    return request.accountId;
  },
);
