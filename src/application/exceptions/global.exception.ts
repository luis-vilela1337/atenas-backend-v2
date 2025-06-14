import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface ErrorResponse {
  status: number;
  error: string;
  message: string;
}

@Injectable()
export class ErrorFormatterInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const formattedError = this.formatError(error);
        return throwError(
          () => new HttpException(formattedError, formattedError.status),
        );
      }),
    );
  }

  private formatError(error: any): ErrorResponse {
    // Mapear erros comuns do seu domínio
    const errorMap: Record<string, ErrorResponse> = {
      'User not found': {
        status: 404,
        error: 'UserNotFound',
        message: 'Usuário não localizado',
      },
      'Institution not found': {
        status: 404,
        error: 'InstitutionNotFound',
        message: 'Instituição não localizada',
      },
      'Invalid credentials': {
        status: 401,
        error: 'InvalidCredentials',
        message: 'Credenciais inválidas',
      },
    };

    if (error instanceof HttpException) {
      const response = error.getResponse();
      if (
        typeof response === 'object' &&
        response !== null &&
        'error' in response &&
        'status' in response &&
        'message' in response
      ) {
        return response as ErrorResponse;
      }
    }

    // Tenta encontrar um mapeamento específico
    const message = this.getMessageFromError(error);
    for (const [key, value] of Object.entries(errorMap)) {
      if (message && message.includes(key)) {
        return value;
      }
    }

    const status = this.getStatusFromError(error);
    return {
      status: status || 500,
      error: this.getErrorName(status || 500),
      message: message || 'Erro interno do servidor',
    };
  }

  private getStatusFromError(error: any): number | undefined {
    if (error instanceof HttpException) {
      return error.getStatus();
    }
    if (error && typeof error === 'object') {
      if ('status' in error && typeof error.status === 'number') {
        return error.status;
      }
      if ('statusCode' in error && typeof error.statusCode === 'number') {
        return error.statusCode;
      }
    }
    return undefined;
  }

  private getMessageFromError(error: any): string {
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof error.message === 'string'
    ) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return '';
  }

  private getErrorName(status: number): string {
    const errorMap: Record<number, string> = {
      400: 'BadRequest',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'NotFound',
      409: 'Conflict',
      422: 'UnprocessableEntity',
      500: 'InternalServerError',
    };

    return errorMap[status] || 'Error';
  }
}
