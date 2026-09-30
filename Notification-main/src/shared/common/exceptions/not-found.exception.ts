import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class NotFoundDomainException extends DomainException {
  readonly code = 'NOT_FOUND';
  readonly httpStatus = HttpStatus.NOT_FOUND;

  constructor(message: string) {
    super(message);
  }
}
