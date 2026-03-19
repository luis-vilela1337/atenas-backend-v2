import { ApiProperty } from '@nestjs/swagger';
import { SendStudentCredentialsOutput } from '@core/insituition/send-student-credentials.usecase';

export class SendCredentialsErrorDto {
  @ApiProperty({ format: 'uuid', description: 'ID do aluno' })
  studentId: string;

  @ApiProperty({ description: 'Email do aluno' })
  email: string;

  @ApiProperty({ description: 'Mensagem de erro' })
  error: string;
}

export class SendCredentialsResponseDto {
  @ApiProperty({ description: 'Total de alunos processados' })
  totalStudents: number;

  @ApiProperty({ description: 'Número de credenciais enviadas (novos alunos)' })
  credentialsSent: number;

  @ApiProperty({ description: 'Número de emails que falharam' })
  failedEmails: number;

  @ApiProperty({
    type: [SendCredentialsErrorDto],
    description: 'Lista de erros ocorridos',
    required: false,
  })
  errors?: SendCredentialsErrorDto[];

  private constructor(data: Partial<SendCredentialsResponseDto>) {
    Object.assign(this, data);
  }

  static adapterToResponse(
    output: SendStudentCredentialsOutput,
  ): SendCredentialsResponseDto {
    return new SendCredentialsResponseDto({
      totalStudents: output.totalStudents,
      credentialsSent: output.credentialsSent,
      failedEmails: output.failedEmails,
      errors: output.errors.length > 0 ? output.errors : undefined,
    });
  }
}
