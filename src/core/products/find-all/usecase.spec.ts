import { Test, TestingModule } from '@nestjs/testing';
import { FindAllProductsUseCase } from './usecase';
import { ProductSQLRepository } from '@infrastructure/data/sql/repositories/products.repository';
import { ImageStorageService } from '@infrastructure/services/image-storage.service';
import { ProductFlag } from '@infrastructure/data/sql/types/product-flag.enum';

describe('FindAllProductsUseCase', () => {
  let useCase: FindAllProductsUseCase;
  let repository: jest.Mocked<ProductSQLRepository>;
  let imageStorageService: jest.Mocked<ImageStorageService>;

  beforeEach(async () => {
    const mockRepository = {
      findAllPaginated: jest.fn(),
    };

    const mockImageService = {
      generateSignedUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllProductsUseCase,
        { provide: ProductSQLRepository, useValue: mockRepository },
        { provide: ImageStorageService, useValue: mockImageService },
      ],
    }).compile();

    useCase = module.get<FindAllProductsUseCase>(FindAllProductsUseCase);
    repository = module.get(ProductSQLRepository);
    imageStorageService = module.get(ImageStorageService);
  });

  describe('execute', () => {
    it('GIVEN valid query parameters WHEN finding all products THEN should return paginated results', async () => {
      // GIVEN
      const input = {
        page: 1,
        limit: 10,
        search: 'test',
        flag: ProductFlag.GENERIC,
      };

      const mockProducts = [
        {
          id: 'uuid1',
          name: 'Test Product 1',
          flag: ProductFlag.GENERIC,
          description: 'Test Description',
          photos: ['photo1.jpg'],
          video: ['video1.mp4'],
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const repositoryResult = {
        products: mockProducts,
        total: 1,
        totalPages: 1,
      };

      repository.findAllPaginated.mockResolvedValue(repositoryResult as any);
      imageStorageService.generateSignedUrl.mockResolvedValue('signed-url');

      // WHEN
      const result = await useCase.execute(input);

      // THEN
      expect(repository.findAllPaginated).toHaveBeenCalledWith(1, 10, {
        flag: ProductFlag.GENERIC,
        search: 'test',
      });
      expect(result.products).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.currentPage).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('GIVEN no filters WHEN finding all products THEN should return all products', async () => {
      // GIVEN
      const input = { page: 1, limit: 10 };
      const repositoryResult = {
        products: [],
        total: 0,
        totalPages: 0,
      };

      repository.findAllPaginated.mockResolvedValue(repositoryResult as any);

      // WHEN
      const result = await useCase.execute(input);

      // THEN
      expect(repository.findAllPaginated).toHaveBeenCalledWith(1, 10, {});
      expect(result.products).toHaveLength(0);
    });
  });
});
