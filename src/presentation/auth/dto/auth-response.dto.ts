import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ description: 'Token de acesso JWT' })
  token: string;

  @ApiProperty({ description: 'Token de refrehs JWT' })
  refreshToken: string;

  @ApiProperty({ description: 'Dados do usuário autenticado' })
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };

  static adapterToResponse(
    token: string,
    refreshToken: string,
    user: { id: string; name: string; email: string; role: string },
  ): AuthResponseDto {
    return { token, user, refreshToken };
  }
}
