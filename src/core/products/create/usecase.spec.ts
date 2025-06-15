import { Test, TestingModule } from '@nestjs/testing';
import { ProductSQLRepository } from '@infrastructure/data/sql/repositories/products.repository';
import { ProductFlag } from '@infrastructure/data/sql/types/product-flag.enum';
import { CreateProductUseCase } from '@core/products/create/usecase';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let repository: jest.Mocked<ProductSQLRepository>;

  beforeEach(async () => {
    const mockRepository = {
      findByName: jest.fn(),
      createProduct: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProductUseCase,
        { provide: ProductSQLRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<CreateProductUseCase>(CreateProductUseCase);
    repository = module.get(ProductSQLRepository);
  });

  describe('execute', () => {
    it('GIVEN valid product data WHEN creating product THEN should create successfully', async () => {
      // GIVEN
      const input = {
        name: 'Test Product',
        flag: ProductFlag.GENERIC,
        description: 'Test Description',
      };

      const savedProduct = { id: 'uuid', ...input };
      const fullProduct = {
        ...savedProduct,
        created_at: new Date(),
        updated_at: new Date(),
      };

      repository.findByName.mockResolvedValue(null);
      repository.createProduct.mockResolvedValue(savedProduct as any);
      repository.findById.mockResolvedValue(fullProduct as any);

      // WHEN
      const result = await useCase.execute(input);

      // THEN
      expect(repository.findByName).toHaveBeenCalledWith('Test Product');
      expect(repository.createProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Product',
          flag: ProductFlag.GENERIC,
          description: 'Test Description',
        }),
      );
      expect(result).toEqual(fullProduct);
    });
  });
});
