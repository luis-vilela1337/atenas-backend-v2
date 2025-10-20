import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordRequestDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'usuario@exemplo.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Código de verificação de 6 dígitos',
    example: '123456',
  })
  @IsString()
  @Length(6, 6, { message: 'O código deve ter 6 dígitos' })
  @Matches(/^\d{6}$/, { message: 'O código deve conter apenas números' })
  code!: string;

  @ApiProperty({
    description: 'Nova senha (mínimo 6 caracteres)',
    example: 'novaSenha123',
  })
  @IsString()
  @Length(6, 128, { message: 'A senha deve ter entre 6 e 128 caracteres' })
  newPassword!: string;
}
