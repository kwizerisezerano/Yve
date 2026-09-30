import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class UnauthorizedDomainException extends DomainException {
  readonly code = 'UNAUTHORIZED';
  readonly httpStatus = HttpStatus.UNAUTHORIZED;

  constructor(message: string) {
    super(message);
  }
}
