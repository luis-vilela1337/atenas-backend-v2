import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '@infrastructure/services/auth.service';

export interface RefreshTokenInput {
  userId: string;
  refreshToken: string;
}

export interface RefreshTokenOutput {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    profileImage?: string | null;
  };
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(private readonly authService: AuthService) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    const { token, user } = await this.authService.refresh(
      input.userId,
      input.refreshToken
    );

    return { token, user };
  }
}