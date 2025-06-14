import {
  GeneratePresignedUrlInput,
  GeneratePresignedUrlUseCase,
} from '@core/storage/generate-presigned-url/usecase';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  GeneratePresignedUrlInputDto,
  PresignedUrlResponseDto,
} from '@presentation/user/dto/presigned-url.dto';

@Injectable()
export class GeneratePresignedUrV2Application {
  constructor(
    private readonly generatePresignedUrl: GeneratePresignedUrlUseCase,
  ) {}

  async execute(
    input: GeneratePresignedUrlInputDto,
  ): Promise<PresignedUrlResponseDto> {
    try {
      const useCaseInput: GeneratePresignedUrlInput = {
        contentType: input.contentType,
        quantity: input.quantity,
      };

      return await this.generatePresignedUrl.execute(useCaseInput);
    } catch (error) {
      throw new BadRequestException(
        `Erro ao gerar URLs de upload: ${error.message}`,
      );
    }
  }
}   