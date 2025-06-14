import { Test, TestingModule } from '@nestjs/testing';
import { ImageStorageService } from '@infrastructure/services/image-storage.service';
import { mockImageStorageService } from '@test/mocks/mock-factory';
import { GeneratePresignedUrlUseCase } from '@core/storage/generate-presigned-url/usecase';

describe('GeneratePresignedUrlUseCase', () => {
  let useCase: GeneratePresignedUrlUseCase;
  let imageStorageService: jest.Mocked<ImageStorageService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeneratePresignedUrlUseCase,
        {
          provide: ImageStorageService,
          useValue: mockImageStorageService(),
        },
      ],
    }).compile();

    useCase = module.get(GeneratePresignedUrlUseCase);
    imageStorageService = module.get(
      ImageStorageService,
    ) as jest.Mocked<ImageStorageService>;
  });

  describe('execute', () => {
    it('should generate multiple presigned URLs successfully', async () => {
      const input = { contentType: 'image/png', quantity: 3 };

      imageStorageService.generateRandomFilename
        .mockReturnValueOnce('file-1.png')
        .mockReturnValueOnce('file-2.png')
        .mockReturnValueOnce('file-3.png');

      imageStorageService.generateUploadSignedUrl
        .mockResolvedValueOnce('https://storage.com/upload/1')
        .mockResolvedValueOnce('https://storage.com/upload/2')
        .mockResolvedValueOnce('https://storage.com/upload/3');

      const result = await useCase.execute(input);

      expect(result.urls).toHaveLength(3);
      expect(result.totalGenerated).toBe(3);
      expect(result.urls[0]).toEqual({
        uploadUrl: 'https://storage.com/upload/1',
        filename: 'file-1.png',
        index: 1,
      });
      expect(imageStorageService.generateRandomFilename).toHaveBeenCalledTimes(
        3,
      );
      expect(imageStorageService.generateUploadSignedUrl).toHaveBeenCalledTimes(
        3,
      );
    });

    it('should throw error for invalid content type', async () => {
      const input = { contentType: 'text/plain', quantity: 1 };

      await expect(useCase.execute(input)).rejects.toThrow(
        'Tipo de conteúdo inválido: text/plain',
      );
    });

    it('should throw error for quantity exceeding maximum limit', async () => {
      const input = { contentType: 'image/png', quantity: 15 };

      await expect(useCase.execute(input)).rejects.toThrow(
        'Quantidade inválida: 15. Permitido: 1-10',
      );
    });

    it('should throw error for zero quantity', async () => {
      const input = { contentType: 'image/jpeg', quantity: 0 };

      await expect(useCase.execute(input)).rejects.toThrow(
        'Quantidade inválida: 0. Permitido: 1-10',
      );
    });

    it('should handle storage service failures gracefully', async () => {
      const input = { contentType: 'image/png', quantity: 2 };

      imageStorageService.generateUploadSignedUrl.mockRejectedValue(
        new Error('Storage service unavailable'),
      );

      await expect(useCase.execute(input)).rejects.toThrow(
        'Falha na geração de URLs presignadas: Storage service unavailable',
      );
    });
  });
});
