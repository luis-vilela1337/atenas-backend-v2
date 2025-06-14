import { ImageStorageService } from '@infrastructure/services/image-storage.service';
import { Injectable } from '@nestjs/common';
import {
  PresignedUrlResponseDto,
  PresignedUrlItemDto,
} from '@presentation/user/dto/presigned-url.dto';

export interface GeneratePresignedUrlInput {
  contentType: string;
  quantity: number;
}

@Injectable()
export class GeneratePresignedUrlUseCase {
  constructor(private readonly imageStorageService: ImageStorageService) {}

  async execute(
    input: GeneratePresignedUrlInput,
  ): Promise<PresignedUrlResponseDto> {
    const { contentType, quantity } = input;

    this.validateContentType(contentType);
    this.validateQuantity(quantity);

    try {
      const urlPromises = Array.from({ length: quantity }, (_, index) =>
        this.generateSinglePresignedUrl(contentType, index + 1),
      );

      const urls = await Promise.all(urlPromises);

      return {
        urls,
        totalGenerated: urls.length,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Falha na geração de URLs presignadas: ${error.message}`);
    }
  }

  private async generateSinglePresignedUrl(
    contentType: string,
    index: number,
  ): Promise<PresignedUrlItemDto> {
    const filename =
      this.imageStorageService.generateRandomFilename(contentType);
    const uploadUrl = await this.imageStorageService.generateUploadSignedUrl(
      filename,
      contentType,
    );

    return {
      uploadUrl,
      filename,
      index,
    };
  }

  private validateContentType(contentType: string): void {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(contentType)) {
      throw new Error(`Tipo de conteúdo inválido: ${contentType}`);
    }
  }

  private validateQuantity(quantity: number): void {
    const MIN_QUANTITY = 1;
    const MAX_QUANTITY = 10;

    if (quantity < MIN_QUANTITY || quantity > MAX_QUANTITY) {
      throw new Error(
        `Quantidade inválida: ${quantity}. Permitido: ${MIN_QUANTITY}-${MAX_QUANTITY}`,
      );
    }
  }
}
