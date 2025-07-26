import { Injectable } from '@nestjs/common';
import {
  LogoutUseCase,
  LogoutInput,
  LogoutOutput,
} from '@core/auth/logout.usecase';

@Injectable()
export class LogoutApplication {
  constructor(private readonly logoutUseCase: LogoutUseCase) {}

  async execute(input: LogoutInput): Promise<LogoutOutput> {
    return await this.logoutUseCase.execute(input);
  }
}
