import { Test, TestingModule } from '@nestjs/testing';
import { InstitutionProductSQLRepository } from '@infrastructure/data/sql/repositories/institution-product.repostitoy';
import { NotFoundException } from '@nestjs/common';
import { DeleteInstitutionProductUseCase } from '@core/institution-products/delete/usecase';

describe('DeleteInstitutionProductUseCase', () => {
  let useCase: DeleteInstitutionProductUseCase;
  let repository: jest.Mocked<InstitutionProductSQLRepository>;

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      deleteInstitutionProduct: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteInstitutionProductUseCase,
        { provide: InstitutionProductSQLRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<DeleteInstitutionProductUseCase>(
      DeleteInstitutionProductUseCase,
    );
    repository = module.get(InstitutionProductSQLRepository);
  });

  describe('execute', () => {
    it('GIVEN valid institution-product ID WHEN deleting relation THEN should delete successfully', async () => {
      // GIVEN
      const relationId = 'valid-uuid';
      const existingRelation = {
        id: relationId,
        flag: 'GENERIC',
        details: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        product: { id: 'product-uuid', name: 'Test Product' },
        institution: { id: 'institution-uuid', name: 'Test Institution' },
      };

      repository.findById.mockResolvedValue(existingRelation as any);
      repository.deleteInstitutionProduct.mockResolvedValue(true);

      // WHEN
      await useCase.execute(relationId);

      // THEN
      expect(repository.findById).toHaveBeenCalledWith(relationId);
      expect(repository.deleteInstitutionProduct).toHaveBeenCalledWith(
        relationId,
      );
    });

    it('GIVEN non-existent institution-product ID WHEN deleting relation THEN should throw NotFoundException', async () => {
      // GIVEN
      const nonExistentId = 'non-existent-uuid';
      repository.findById.mockResolvedValue(null);

      // WHEN & THEN
      await expect(useCase.execute(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findById).toHaveBeenCalledWith(nonExistentId);
      expect(repository.deleteInstitutionProduct).not.toHaveBeenCalled();
    });

    it('GIVEN repository error WHEN deleting institution-product THEN should propagate error', async () => {
      // GIVEN
      const relationId = 'valid-uuid';
      const existingRelation = {
        id: relationId,
        flag: 'GENERIC',
        product: { id: 'product-uuid' },
        institution: { id: 'institution-uuid' },
      };
      const repositoryError = new Error('Database error');

      repository.findById.mockResolvedValue(existingRelation as any);
      repository.deleteInstitutionProduct.mockRejectedValue(repositoryError);

      // WHEN & THEN
      await expect(useCase.execute(relationId)).rejects.toThrow(
        repositoryError,
      );
      expect(repository.findById).toHaveBeenCalledWith(relationId);
      expect(repository.deleteInstitutionProduct).toHaveBeenCalledWith(
        relationId,
      );
    });
  });
});
