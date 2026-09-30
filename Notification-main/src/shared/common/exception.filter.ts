import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from './api-response';
import { DomainException } from './exceptions/domain.exception';

interface ErrorDetails {
  code: string;
  path: string;
  timestamp: string;
}

interface ResolvedError {
  status: number;
  message: string;
  details: ErrorDetails;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, details } = this.resolve(exception, request.url);
    ApiResponse.error(response, message, details, status);
  }

  private resolve(exception: unknown, path: string): ResolvedError {
    const timestamp = new Date().toISOString();

    if (exception instanceof DomainException) {
      return {
        status: exception.httpStatus,
        message: exception.message,
        details: { code: exception.code, path, timestamp },
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      const message =
        typeof payload === 'string'
          ? payload
          : ((payload as { message?: string | string[] }).message ??
            exception.message);

      return {
        status,
        message: Array.isArray(message) ? message.join(', ') : message,
        details: { code: HttpStatus[status] ?? 'HTTP_ERROR', path, timestamp },
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred.',
      details: { code: 'INTERNAL_ERROR', path, timestamp },
    };
  }
}
