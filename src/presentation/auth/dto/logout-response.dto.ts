import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
  @ApiProperty({ description: 'Indicador de sucesso' })
  success: boolean;

  @ApiProperty({ description: 'Mensagem da operação' })
  message: string;

  static adapterToResponse(): LogoutResponseDto {
    return { success: true, message: 'Logout realizado com sucesso' };
  }
}
