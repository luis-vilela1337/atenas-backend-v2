import { Test, TestingModule } from '@nestjs/testing';
import { ImageStorageService } from '@infrastructure/services/image-storage.service';
import { mockImageStorageService } from '@test/mocks/mock-factory';
import { GeneratePresignedUrlUseCase } from '@core/storage/generate-presigned-url/usecase';
import { MediaType } from '@presentation/user/dto/presigned-url.dto';

describe('GeneratePresignedUrlUseCase - Enhanced with Video Support', () => {
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

  describe('Video Upload Tests', () => {
    it('should generate presigned URLs for video uploads', async () => {
      // GIVEN
      const input = { contentType: 'video/mp4', quantity: 2 };

      imageStorageService.generateRandomFilename
        .mockReturnValueOnce('video-abc123-1640995200000.mp4')
        .mockReturnValueOnce('video-def456-1640995200001.mp4');

      imageStorageService.generateUploadSignedUrl
        .mockResolvedValueOnce('https://storage.com/upload/video1')
        .mockResolvedValueOnce('https://storage.com/upload/video2');

      // WHEN
      const result = await useCase.execute(input);

      // THEN
      expect(result.urls).toHaveLength(2);
      expect(result.mediaType).toBe(MediaType.VIDEO);
      expect(result.urls[0]).toMatchObject({
        uploadUrl: 'https://storage.com/upload/video1',
        filename: 'video-abc123-1640995200000.mp4',
        index: 1,
        mediaType: MediaType.VIDEO,
      });
      expect(imageStorageService.generateRandomFilename).toHaveBeenCalledWith(
        'video/mp4',
        MediaType.VIDEO,
      );
    });

    it('should enforce video quantity limits (max 5)', async () => {
      // GIVEN
      const input = { contentType: 'video/mp4', quantity: 6 };

      // WHEN & THEN
      await expect(useCase.execute(input)).rejects.toThrow(
        'Quantidade inválida para video: 6. Permitido: 1-5',
      );
    });

    it('should validate video content types', async () => {
      // GIVEN
      const input = { contentType: 'video/avi', quantity: 1 };

      // WHEN & THEN
      await expect(useCase.execute(input)).rejects.toThrow(
        'Tipo de conteúdo inválido para video: video/avi',
      );
    });

    it('should accept valid video formats', async () => {
      // GIVEN
      const validFormats = ['video/mp4', 'video/quicktime', 'video/webm'];

      for (const format of validFormats) {
        const input = { contentType: format, quantity: 1 };

        imageStorageService.generateRandomFilename.mockReturnValue('test-file');
        imageStorageService.generateUploadSignedUrl.mockResolvedValue(
          'test-url',
        );

        // WHEN
        const result = await useCase.execute(input);

        // THEN
        expect(result.mediaType).toBe(MediaType.VIDEO);
      }
    });
  });

  describe('Backward Compatibility Tests', () => {
    it('should maintain existing image functionality', async () => {
      // GIVEN
      const input = { contentType: 'image/png', quantity: 3 };

      imageStorageService.generateRandomFilename
        .mockReturnValueOnce('image-file-1.png')
        .mockReturnValueOnce('image-file-2.png')
        .mockReturnValueOnce('image-file-3.png');

      imageStorageService.generateUploadSignedUrl
        .mockResolvedValueOnce('https://storage.com/upload/1')
        .mockResolvedValueOnce('https://storage.com/upload/2')
        .mockResolvedValueOnce('https://storage.com/upload/3');

      // WHEN
      const result = await useCase.execute(input);

      // THEN
      expect(result.urls).toHaveLength(3);
      expect(result.mediaType).toBe(MediaType.IMAGE);
      expect(result.totalGenerated).toBe(3);
    });
  });

  describe('Auto-Detection Tests', () => {
    it('should auto-detect media type from contentType', async () => {
      // GIVEN
      const videoInput = { contentType: 'video/mp4', quantity: 1 };
      const imageInput = { contentType: 'image/jpeg', quantity: 1 };

      imageStorageService.generateRandomFilename.mockReturnValue('test-file');
      imageStorageService.generateUploadSignedUrl.mockResolvedValue('test-url');

      // WHEN
      const videoResult = await useCase.execute(videoInput);
      const imageResult = await useCase.execute(imageInput);

      // THEN
      expect(videoResult.mediaType).toBe(MediaType.VIDEO);
      expect(imageResult.mediaType).toBe(MediaType.IMAGE);
    });

    it('should reject unsupported content types', async () => {
      // GIVEN
      const input = { contentType: 'application/pdf', quantity: 1 };

      // WHEN & THEN
      await expect(useCase.execute(input)).rejects.toThrow(
        'Tipo de mídia não detectado para: application/pdf',
      );
    });
  });
});
