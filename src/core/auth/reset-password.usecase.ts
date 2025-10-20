import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserSQLRepository } from '@infrastructure/data/sql/repositories/user.repository';
import { PasswordResetCodeRepository } from '@infrastructure/data/sql/repositories/password-reset-code.repository';
import * as bcrypt from 'bcryptjs';

export interface ResetPasswordInput {
  email: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordOutput {
  success: boolean;
}

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: UserSQLRepository,
    private readonly resetCodeRepository: PasswordResetCodeRepository,
  ) {}

  async execute(input: ResetPasswordInput): Promise<ResetPasswordOutput> {
    // Buscar usuário por email
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Buscar código válido
    const resetCode = await this.resetCodeRepository.findValidCode(
      user.id,
      input.code,
    );

    if (!resetCode) {
      throw new BadRequestException('Código de verificação inválido');
    }

    // Verificar se o código expirou
    if (new Date() > resetCode.expiresAt) {
      throw new BadRequestException('Código de verificação expirado');
    }

    // Verificar se o código já foi usado
    if (resetCode.used) {
      throw new BadRequestException('Código de verificação já utilizado');
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(input.newPassword, 10);

    // Atualizar senha do usuário
    await this.userRepository.updateUser(user.id, {
      passwordHash: hashedPassword,
    });

    // Marcar código como usado
    await this.resetCodeRepository.markAsUsed(resetCode.id);

    return {
      success: true,
    };
  }
}
