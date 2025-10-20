import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordResponseDto {
  @ApiProperty({
    description: 'Indica se a senha foi redefinida com sucesso',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Mensagem de sucesso',
    example: 'Senha redefinida com sucesso',
  })
  message!: string;

  static adapterToResponse(): ResetPasswordResponseDto {
    return {
      success: true,
      message: 'Senha redefinida com sucesso',
    };
  }
}
