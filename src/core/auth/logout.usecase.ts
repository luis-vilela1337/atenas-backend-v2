import { Injectable } from '@nestjs/common';
import { AuthService } from '@infrastructure/services/auth.service';

export interface LogoutInput {
  userId: string;
}

export interface LogoutOutput {
  success: boolean;
}

@Injectable()
export class LogoutUseCase {
  constructor(private readonly authService: AuthService) {}

  async execute(input: LogoutInput): Promise<LogoutOutput> {
    await this.authService.logout(input.userId);
    return { success: true };
  }
}
