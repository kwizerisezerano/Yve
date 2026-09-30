import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class ServiceUnavailableDomainException extends DomainException {
  readonly code = 'SERVICE_UNAVAILABLE';
  readonly httpStatus = HttpStatus.SERVICE_UNAVAILABLE;

  constructor(message: string) {
    super(message);
  }
}
