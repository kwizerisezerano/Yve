import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class ValidationDomainException extends DomainException {
  readonly code = 'VALIDATION_ERROR';
  readonly httpStatus = HttpStatus.BAD_REQUEST;

  constructor(message: string) {
    super(message);
  }
}
