import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordResponseDto {
  @ApiProperty({
    description: 'Mensagem de sucesso',
    example: 'Código de verificação enviado para o email',
  })
  message!: string;

  @ApiProperty({
    description: 'Email para onde o código foi enviado (parcialmente oculto)',
    example: 'us***@exemplo.com',
  })
  email!: string;

  static adapterToResponse(email: string): ForgotPasswordResponseDto {
    const maskedEmail = this.maskEmail(email);
    return {
      message: 'Código de verificação enviado para o email',
      email: maskedEmail,
    };
  }

  private static maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) {
      return `${localPart[0]}***@${domain}`;
    }
    const visibleChars = Math.max(2, Math.floor(localPart.length * 0.3));
    const maskedPart = localPart.substring(0, visibleChars) + '***';
    return `${maskedPart}@${domain}`;
  }
}
