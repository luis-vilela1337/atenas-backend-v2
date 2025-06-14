import { HttpException } from '@nestjs/common';

export class DomainException extends HttpException {
  constructor(message: string, status = 400) {
    super(message, status);
  }
}
