import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class ConflictDomainException extends DomainException {
  readonly code = 'CONFLICT';
  readonly httpStatus = HttpStatus.CONFLICT;

  constructor(message: string) {
    super(message);
  }
}
