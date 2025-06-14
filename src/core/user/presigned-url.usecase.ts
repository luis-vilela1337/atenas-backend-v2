import { ImageStorageService } from '@infrastructure/services/image-storage.service';
import { Injectable } from '@nestjs/common';
import { PresignedUrlResponseDto } from '@presentation/user/dto/presigned-url.dto';

@Injectable()
export class GeneratePresignedUrlUseCase {
  constructor(private readonly imageStorageService: ImageStorageService) {}

  async execute(contentType: string): Promise<PresignedUrlResponseDto> {
    const filename =
      this.imageStorageService.generateRandomFilename(contentType);

    const uploadUrl = await this.imageStorageService.generateUploadSignedUrl(
      filename,
      contentType,
    );

    return {
      uploadUrl,
      filename,
    };
  }
}
