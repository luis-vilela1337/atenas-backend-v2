import { Test, TestingModule } from '@nestjs/testing';
import { FindProductByIdUseCase } from './usecase';
import { ProductSQLRepository } from '@infrastructure/data/sql/repositories/products.repository';
import { ImageStorageService } from '@infrastructure/services/image-storage.service';
import { NotFoundException } from '@nestjs/common';
import { ProductFlag } from '@infrastructure/data/sql/types/product-flag.enum';

describe('FindProductByIdUseCase', () => {
  let useCase: FindProductByIdUseCase;
  let repository: jest.Mocked<ProductSQLRepository>;
  let imageStorageService: jest.Mocked<ImageStorageService>;

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
    };

    const mockImageService = {
      generateSignedUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindProductByIdUseCase,
        { provide: ProductSQLRepository, useValue: mockRepository },
        { provide: ImageStorageService, useValue: mockImageService },
      ],
    }).compile();

    useCase = module.get<FindProductByIdUseCase>(FindProductByIdUseCase);
    repository = module.get(ProductSQLRepository);
    imageStorageService = module.get(ImageStorageService);
  });

  describe('execute', () => {
    const mockProduct = {
      id: 'uuid-123',
      name: 'Test Product',
      flag: ProductFlag.GENERIC,
      description: 'Test Description',
      photos: ['photo1.jpg', 'photo2.jpg'],
      video: ['video1.mp4'],
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('GIVEN valid product ID WHEN finding product THEN should return product with signed URLs', async () => {
      // GIVEN
      const productId = 'uuid-123';
      repository.findById.mockResolvedValue(mockProduct as any);
      imageStorageService.generateSignedUrl.mockResolvedValue(
        'https://signed-url.com',
      );

      // WHEN
      const result = await useCase.execute(productId);

      // THEN
      expect(repository.findById).toHaveBeenCalledWith(productId);
      expect(imageStorageService.generateSignedUrl).toHaveBeenCalledTimes(3);
      expect(imageStorageService.generateSignedUrl).toHaveBeenCalledWith(
        'photo1.jpg',
        'read',
      );
      expect(imageStorageService.generateSignedUrl).toHaveBeenCalledWith(
        'photo2.jpg',
        'read',
      );
      expect(imageStorageService.generateSignedUrl).toHaveBeenCalledWith(
        'video1.mp4',
        'read',
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: productId,
          name: 'Test Product',
          photos: ['https://signed-url.com', 'https://signed-url.com'],
          video: ['https://signed-url.com'],
        }),
      );
    });

    it('GIVEN non-existent product ID WHEN finding product THEN should throw NotFoundException', async () => {
      // GIVEN
      const productId = 'non-existent-uuid';
      repository.findById.mockResolvedValue(null);

      // WHEN & THEN
      await expect(useCase.execute(productId)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findById).toHaveBeenCalledWith(productId);
      expect(imageStorageService.generateSignedUrl).not.toHaveBeenCalled();
    });

    it('GIVEN product without photos and videos WHEN finding product THEN should return product without generating URLs', async () => {
      // GIVEN
      const productWithoutMedia = {
        ...mockProduct,
        photos: [],
        video: [],
      };
      repository.findById.mockResolvedValue(productWithoutMedia as any);

      // WHEN
      const result = await useCase.execute('uuid-123');

      // THEN
      expect(repository.findById).toHaveBeenCalledWith('uuid-123');
      expect(imageStorageService.generateSignedUrl).not.toHaveBeenCalled();
      expect(result.photos).toEqual([]);
      expect(result.video).toEqual([]);
    });

    it('GIVEN product with null photos and videos WHEN finding product THEN should return product without errors', async () => {
      // GIVEN
      const productWithNullMedia = {
        ...mockProduct,
        photos: null,
        video: null,
      };
      repository.findById.mockResolvedValue(productWithNullMedia as any);

      // WHEN
      const result = await useCase.execute('uuid-123');

      // THEN
      expect(repository.findById).toHaveBeenCalledWith('uuid-123');
      expect(imageStorageService.generateSignedUrl).not.toHaveBeenCalled();
      expect(result).toEqual(productWithNullMedia);
    });
  });
});
