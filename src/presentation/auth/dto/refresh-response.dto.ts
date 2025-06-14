import { ApiProperty } from '@nestjs/swagger';

export class RefreshResponseDto {
  @ApiProperty({ description: 'Novo token JWT' })
  token: string;

  static adapterToResponse(token: string): RefreshResponseDto {
    return { token };
  }
}
