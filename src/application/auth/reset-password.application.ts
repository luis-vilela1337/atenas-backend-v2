import { Injectable } from '@nestjs/common';
import {
  ResetPasswordUseCase,
  ResetPasswordInput,
  ResetPasswordOutput,
} from '@core/auth/reset-password.usecase';

@Injectable()
export class ResetPasswordApplication {
  constructor(private readonly resetPasswordUseCase: ResetPasswordUseCase) {}

  async execute(input: ResetPasswordInput): Promise<ResetPasswordOutput> {
    return await this.resetPasswordUseCase.execute(input);
  }
}
