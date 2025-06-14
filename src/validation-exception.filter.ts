import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException, HttpException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException | HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'object' && exceptionResponse['errors']) {
      return response.status(status).json(exceptionResponse);
    }

    response.status(status).json(exceptionResponse);
  }
}
