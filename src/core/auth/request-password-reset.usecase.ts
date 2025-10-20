import { Injectable, NotFoundException } from '@nestjs/common';
import { UserSQLRepository } from '@infrastructure/data/sql/repositories/user.repository';
import { PasswordResetCodeRepository } from '@infrastructure/data/sql/repositories/password-reset-code.repository';
import { MailerSendService } from '@infrastructure/services/mailersend.service';

export interface RequestPasswordResetInput {
  email: string;
}

export interface RequestPasswordResetOutput {
  success: boolean;
  email: string;
}

@Injectable()
export class RequestPasswordResetUseCase {
  constructor(
    private readonly userRepository: UserSQLRepository,
    private readonly resetCodeRepository: PasswordResetCodeRepository,
    private readonly emailService: MailerSendService,
  ) {}

  async execute(
    input: RequestPasswordResetInput,
  ): Promise<RequestPasswordResetOutput> {
    // Buscar usuário por email
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Invalidar códigos anteriores do usuário
    await this.resetCodeRepository.invalidateUserCodes(user.id);

    // Gerar código de 6 dígitos
    const code = this.generateVerificationCode();

    // Definir expiração (15 minutos)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Salvar código no banco
    await this.resetCodeRepository.create(user, code, expiresAt);

    // Enviar email com código
    const emailResult = await this.emailService.sendPasswordResetCodeEmail(
      { email: user.email, name: user.name },
      code,
    );

    if (!emailResult.success) {
      throw new Error(
        `Falha ao enviar email: ${emailResult.error || 'Erro desconhecido'}`,
      );
    }

    return {
      success: true,
      email: user.email,
    };
  }

  private generateVerificationCode(): string {
    // Gera código de 6 dígitos (100000 - 999999)
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
