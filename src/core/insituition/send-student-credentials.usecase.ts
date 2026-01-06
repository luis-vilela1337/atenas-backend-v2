import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UserSQLRepository } from '@infrastructure/data/sql/repositories/user.repository';
import { InstitutionSQLRepository } from '@infrastructure/data/sql/repositories/institution.repository';
import { MailerSendService } from '@infrastructure/services/mailersend.service';
import { PasswordResetCodeRepository } from '@infrastructure/data/sql/repositories/password-reset-code.repository';

export interface SendStudentCredentialsInput {
  institutionId: string;
  adminUserId: string;
}

export interface SendStudentCredentialsOutput {
  totalStudents: number;
  credentialsSent: number;
  failedEmails: number;
  errors: Array<{ studentId: string; email: string; error: string }>;
}

@Injectable()
export class SendStudentCredentialsUseCase {
  private readonly logger = new Logger(SendStudentCredentialsUseCase.name);

  constructor(
    private readonly userRepository: UserSQLRepository,
    private readonly institutionRepository: InstitutionSQLRepository,
    private readonly mailerSendService: MailerSendService,
    private readonly passwordResetCodeRepository: PasswordResetCodeRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    input: SendStudentCredentialsInput,
  ): Promise<SendStudentCredentialsOutput> {
    const institution = await this.institutionRepository.findById(
      input.institutionId,
    );
    if (!institution) {
      throw new NotFoundException('Instituição não encontrada');
    }

    const admin = await this.userRepository.findById(input.adminUserId);
    if (!admin || admin.role !== 'admin') {
      throw new ForbiddenException('Usuário não é administrador');
    }

    if (admin.institution?.id !== input.institutionId) {
      throw new ForbiddenException(
        'Administrador não pertence a esta instituição',
      );
    }

    const students = await this.userRepository.findActiveClientsByInstitutionId(
      input.institutionId,
    );

    if (students.length === 0) {
      return {
        totalStudents: 0,
        credentialsSent: 0,
        failedEmails: 0,
        errors: [],
      };
    }

    const neverLoggedIn = students.filter((s) => !s.lastLoginAt);

    const result: SendStudentCredentialsOutput = {
      totalStudents: students.length,
      credentialsSent: 0,
      failedEmails: 0,
      errors: [],
    };

    const loginUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'https://app.atenasformaturas.com.br';

    for (const student of neverLoggedIn) {
      try {
        const temporaryPassword = this.generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        await this.userRepository.updateUser(student.id, {
          passwordHash: hashedPassword,
        });

        const emailResult =
          await this.mailerSendService.sendStudentCredentialsEmail(
            { email: student.email, name: student.name },
            {
              email: student.email,
              temporaryPassword,
              loginUrl,
            },
          );

        if (emailResult.success) {
          result.credentialsSent++;
          this.logger.log(`Credentials sent to ${student.email}`);
        } else {
          result.failedEmails++;
          result.errors.push({
            studentId: student.id,
            email: student.email,
            error: emailResult.error || 'Failed to send email',
          });
        }
      } catch (error) {
        result.failedEmails++;
        result.errors.push({
          studentId: student.id,
          email: student.email,
          error: error.message || 'Unknown error',
        });
        this.logger.error(`Failed to process student ${student.email}`, error);
      }
    }

    this.logger.log(
      `Credentials process completed for institution ${institution.name}: ` +
        `${result.credentialsSent} credentials sent, ` +
        `${result.failedEmails} failed`,
    );

    return result;
  }

  private generateTemporaryPassword(length = 8): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
