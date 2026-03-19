import {
  SendStudentCredentialsUseCase,
  SendStudentCredentialsInput,
  SendStudentCredentialsOutput,
} from '@core/insituition/send-student-credentials.usecase';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SendStudentCredentialsApplication {
  private readonly logger = new Logger(SendStudentCredentialsApplication.name);

  constructor(
    private readonly sendStudentCredentialsUseCase: SendStudentCredentialsUseCase,
  ) {}

  async execute(
    input: SendStudentCredentialsInput,
  ): Promise<SendStudentCredentialsOutput> {
    this.logger.log(
      `Starting credentials send for institution: ${input.institutionId}`,
    );
    try {
      const result = await this.sendStudentCredentialsUseCase.execute(input);
      this.logger.log(
        `Credentials send completed: ${result.credentialsSent} credentials,`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send credentials: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
