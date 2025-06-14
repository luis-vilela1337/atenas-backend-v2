import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { InternalServerErrorException } from '@nestjs/common';
import { DomainException } from 'src/core/excepetions/domain-exception';

export class ErrorResult extends HttpException {
  constructor(response: string, status: number) {
    super(response, status);
  }

  static build(error: any): ErrorResult {
    if (error instanceof DomainException)
      return new ErrorResult(error.message, error.getStatus());

    return new InternalServerErrorException(error.message);
  }
}
