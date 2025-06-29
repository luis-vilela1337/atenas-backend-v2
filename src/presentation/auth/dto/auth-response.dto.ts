import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: ['admin', 'client'] })
  role: string;

  @ApiProperty({ nullable: true })
  profileImage: string | null;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'Token de acesso JWT' })
  token: string;

  @ApiProperty({ description: 'Token de refresh JWT' })
  refreshToken: string;

  @ApiProperty({ type: AuthUserDto, description: 'Dados do usuário autenticado' })
  user: AuthUserDto;

  static adapterToResponse(
    token: string,
    refreshToken: string,
    user: { 
      id: string; 
      name: string; 
      email: string; 
      role: string;
      profileImage?: string | null;
    },
  ): AuthResponseDto {
    return { 
      token, 
      refreshToken, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || null,
      }
    };
  }
}