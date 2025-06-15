import { Test, TestingModule } from '@nestjs/testing';
import { ProductSQLRepository } from '@infrastructure/data/sql/repositories/products.repository';
import { NotFoundException } from '@nestjs/common';
import { DeleteProductUseCase } from '@core/products/delete/usecase';

describe('DeleteProductUseCase', () => {
  let useCase: DeleteProductUseCase;
  let repository: jest.Mocked<ProductSQLRepository>;

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      hardDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteProductUseCase,
        { provide: ProductSQLRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<DeleteProductUseCase>(DeleteProductUseCase);
    repository = module.get(ProductSQLRepository);
  });

  describe('execute', () => {
    it('GIVEN valid product ID WHEN deleting product THEN should delete successfully', async () => {
      // GIVEN
      const productId = 'valid-uuid';
      const existingProduct = {
        id: productId,
        name: 'Test Product',
        flag: 'GENERIC',
        created_at: new Date(),
        updated_at: new Date(),
      };

      repository.findById.mockResolvedValue(existingProduct as any);
      repository.hardDelete.mockResolvedValue(undefined);

      // WHEN
      await useCase.execute(productId);

      // THEN
      expect(repository.findById).toHaveBeenCalledWith(productId);
      expect(repository.hardDelete).toHaveBeenCalledWith(productId);
    });

    it('GIVEN non-existent product ID WHEN deleting product THEN should throw NotFoundException', async () => {
      // GIVEN
      const nonExistentId = 'non-existent-uuid';
      repository.findById.mockResolvedValue(null);

      // WHEN & THEN
      await expect(useCase.execute(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findById).toHaveBeenCalledWith(nonExistentId);
      expect(repository.hardDelete).not.toHaveBeenCalled();
    });

    it('GIVEN repository error WHEN deleting product THEN should propagate error', async () => {
      // GIVEN
      const productId = 'valid-uuid';
      const existingProduct = { id: productId, name: 'Test Product' };
      const repositoryError = new Error('Database error');

      repository.findById.mockResolvedValue(existingProduct as any);
      repository.hardDelete.mockRejectedValue(repositoryError);

      // WHEN & THEN
      await expect(useCase.execute(productId)).rejects.toThrow(repositoryError);
      expect(repository.findById).toHaveBeenCalledWith(productId);
      expect(repository.hardDelete).toHaveBeenCalledWith(productId);
    });
  });
});
