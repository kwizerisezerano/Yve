import { HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

export interface ApiResponseBody<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export class ApiResponse {
  static success<T = null>(
    res: Response,
    message = 'Success',
    data: T | null = null,
    status: number = HttpStatus.OK,
  ): Response {
    const body: ApiResponseBody<T> = { success: true, message, data };
    return res.status(status).json(body);
  }

  static error<T = null>(
    res: Response,
    message = 'An error occurred',
    data: T | null = null,
    status: number = HttpStatus.BAD_REQUEST,
  ): Response {
    const body: ApiResponseBody<T> = { success: false, message, data };
    return res.status(status).json(body);
  }
}
