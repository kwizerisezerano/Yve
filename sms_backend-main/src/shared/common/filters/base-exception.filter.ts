import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '../exceptions/domain.exception';

interface ErrorBody {
  status: number;
  message: string;
  result: unknown;
}

@Catch()
export class BaseExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, result } = this.resolve(exception, request);

    response.status(status).json({ statusCode: status, message, result });
  }

  private resolve(exception: unknown, request: Request): ErrorBody {
    const path = request.url;
    const timestamp = new Date().toISOString();

    if (exception instanceof DomainException) {
      return {
        status: exception.httpStatus,
        message: exception.message,
        result: { code: exception.code, path, timestamp },
      };
    }

    if (exception instanceof HttpException) {
      const httpResponse = exception.getResponse();
      return {
        status: exception.getStatus(),
        message: this.extractMessage(httpResponse, exception.message),
        result: { path, timestamp, detail: httpResponse },
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      result: { path, timestamp },
    };
  }

  private extractMessage(httpResponse: unknown, fallback: string): string {
    if (typeof httpResponse === 'string') {
      return httpResponse;
    }

    if (typeof httpResponse === 'object' && httpResponse !== null && 'message' in httpResponse) {
      const message = (httpResponse as { message: unknown }).message;
      if (typeof message === 'string') {
        return message;
      }
      if (Array.isArray(message)) {
        return message.join(', ');
      }
    }

    return fallback;
  }
}
