import { ApiProperty } from '@nestjs/swagger';

export class RefreshUserDto {
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

export class RefreshResponseDto {
  @ApiProperty({ description: 'Novo token JWT' })
  token: string;

  @ApiProperty({
    type: RefreshUserDto,
    description: 'Dados do usuário autenticado',
  })
  user: RefreshUserDto;

  static adapterToResponse(
    token: string,
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      profileImage?: string | null;
    },
  ): RefreshResponseDto {
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || null,
      },
    };
  }
}
