import { GeneratePresignedUrlUseCase } from '@core/user/presigned-url.usecase';
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
      const result = await this.generatePresignedUrl.execute(input.contentType);

      return {
        uploadUrl: result.uploadUrl,
        filename: result.filename,
      };
    } catch (e) {
      throw new BadRequestException(
        `Erro ao gerar URL de upload: ${e.message}`,
      );
    }
  }
}
