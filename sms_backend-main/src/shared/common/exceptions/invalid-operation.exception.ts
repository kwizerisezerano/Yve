import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class InvalidOperationException extends DomainException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST, 'INVALID_OPERATION');
  }
}
