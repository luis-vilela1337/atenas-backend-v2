import { ImageStorageService } from '@infrastructure/services/image-storage.service';
import { Injectable } from '@nestjs/common';
import {
  MediaType,
  PresignedUrlItemDto,
  PresignedUrlResponseDto,
} from '@presentation/user/dto/presigned-url.dto';

export interface GeneratePresignedUrlInput {
  contentType: string;
  quantity: number;
  mediaType?: MediaType; // Auto-detected from contentType if not provided
}

@Injectable()
export class GeneratePresignedUrlUseCase {
  constructor(private readonly imageStorageService: ImageStorageService) {}

  async execute(
    input: GeneratePresignedUrlInput,
  ): Promise<PresignedUrlResponseDto> {
    const { contentType, quantity } = input;
    const mediaType = input.mediaType || this.detectMediaType(contentType);

    this.validateContentType(contentType, mediaType);
    this.validateQuantity(quantity, mediaType);

    try {
      const urlPromises = Array.from({ length: quantity }, (_, index) =>
        this.generateSinglePresignedUrl(contentType, mediaType, index + 1),
      );

      const urls = await Promise.all(urlPromises);

      return {
        urls,
        totalGenerated: urls.length,
        generatedAt: new Date().toISOString(),
        mediaType,
      };
    } catch (error) {
      throw new Error(`Falha na geração de URLs presignadas: ${error.message}`);
    }
  }

  private async generateSinglePresignedUrl(
    contentType: string,
    mediaType: MediaType,
    index: number,
  ): Promise<PresignedUrlItemDto> {
    const filename = this.imageStorageService.generateRandomFilename(
      contentType,
      mediaType,
    );
    const uploadUrl = await this.imageStorageService.generateUploadSignedUrl(
      filename,
      contentType,
      mediaType,
    );

    return {
      uploadUrl,
      filename,
      index,
      mediaType,
    };
  }

  private detectMediaType(contentType: string): MediaType {
    if (contentType.startsWith('image/')) return MediaType.IMAGE;
    if (contentType.startsWith('video/')) return MediaType.VIDEO;
    throw new Error(`Tipo de mídia não detectado para: ${contentType}`);
  }

  private validateContentType(contentType: string, mediaType: MediaType): void {
    const allowedTypes = {
      [MediaType.IMAGE]: ['image/jpeg', 'image/png', 'image/webp'],
      [MediaType.VIDEO]: [
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm',
      ],
    };

    if (!allowedTypes[mediaType].includes(contentType)) {
      throw new Error(
        `Tipo de conteúdo inválido para ${mediaType}: ${contentType}. ` +
          `Permitidos: ${allowedTypes[mediaType].join(', ')}`,
      );
    }
  }

  private validateQuantity(quantity: number, mediaType: MediaType): void {
    const limits = {
      [MediaType.IMAGE]: { min: 1, max: 10 },
      [MediaType.VIDEO]: { min: 1, max: 5 }, // Reduced limit for videos due to size
    };

    const { min, max } = limits[mediaType];

    if (quantity < min || quantity > max) {
      throw new Error(
        `Quantidade inválida para ${mediaType}: ${quantity}. ` +
          `Permitido: ${min}-${max}`,
      );
    }
  }
}
