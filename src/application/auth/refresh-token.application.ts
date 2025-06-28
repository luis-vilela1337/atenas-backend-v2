import { Injectable } from '@nestjs/common';
import { RefreshTokenUseCase, RefreshTokenInput, RefreshTokenOutput } from '@core/auth/refresh-token.usecase';

@Injectable()
export class RefreshTokenApplication {
  constructor(private readonly refreshTokenUseCase: RefreshTokenUseCase) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    return await this.refreshTokenUseCase.execute(input);
  }
}