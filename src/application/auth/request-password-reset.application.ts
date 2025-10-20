import { Injectable } from '@nestjs/common';
import {
  RequestPasswordResetUseCase,
  RequestPasswordResetInput,
  RequestPasswordResetOutput,
} from '@core/auth/request-password-reset.usecase';

@Injectable()
export class RequestPasswordResetApplication {
  constructor(
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
  ) {}

  async execute(
    input: RequestPasswordResetInput,
  ): Promise<RequestPasswordResetOutput> {
    return await this.requestPasswordResetUseCase.execute(input);
  }
}
