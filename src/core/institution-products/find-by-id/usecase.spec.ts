import { Test, TestingModule } from '@nestjs/testing';
import { FindInstitutionProductByIdUseCase } from './usecase';
import { NotFoundException } from '@nestjs/common';
import { ProductFlag } from '@infrastructure/data/sql/types/product-flag.enum';
import { InstitutionProductSQLRepository } from '@infrastructure/data/sql/repositories/institution-product.repostitoy';

describe('FindInstitutionProductByIdUseCase', () => {
  let useCase: FindInstitutionProductByIdUseCase;
  let repository: jest.Mocked<InstitutionProductSQLRepository>;

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindInstitutionProductByIdUseCase,
        { provide: InstitutionProductSQLRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<FindInstitutionProductByIdUseCase>(
      FindInstitutionProductByIdUseCase,
    );
    repository = module.get(InstitutionProductSQLRepository);
  });

  describe('execute', () => {
    const mockInstitutionProduct = {
      id: 'relation-uuid',
      product: {
        id: 'product-uuid',
        name: 'Test Product',
        flag: ProductFlag.ALBUM,
        description: 'Test Description',
        photos: ['photo1.jpg'],
        video: ['video1.mp4'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      institution: {
        id: 'institution-uuid',
        name: 'Test Institution',
        contractNumber: 'CONTRACT001',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      flag: ProductFlag.ALBUM,
      details: {
        minPhoto: 5,
        maxPhoto: 50,
        valorEncadernacao: 25.99,
        valorFoto: 2.5,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('GIVEN valid relation ID WHEN finding institution-product relation THEN should return relation with full data', async () => {
      // GIVEN
      const relationId = 'relation-uuid';
      repository.findById.mockResolvedValue(mockInstitutionProduct as any);

      // WHEN
      const result = await useCase.execute(relationId);

      // THEN
      expect(repository.findById).toHaveBeenCalledWith(relationId);
      expect(result).toEqual(mockInstitutionProduct);
      expect(result.product).toBeDefined();
      expect(result.institution).toBeDefined();
      expect(result.details).toBeDefined();
    });

    it('GIVEN non-existent relation ID WHEN finding institution-product relation THEN should throw NotFoundException', async () => {
      // GIVEN
      const nonExistentId = 'non-existent-uuid';
      repository.findById.mockResolvedValue(null);

      // WHEN & THEN
      await expect(useCase.execute(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findById).toHaveBeenCalledWith(nonExistentId);
    });

    it('GIVEN repository error WHEN finding institution-product relation THEN should propagate error', async () => {
      // GIVEN
      const relationId = 'relation-uuid';
      const repositoryError = new Error('Database connection error');
      repository.findById.mockRejectedValue(repositoryError);

      // WHEN & THEN
      await expect(useCase.execute(relationId)).rejects.toThrow(
        repositoryError,
      );
      expect(repository.findById).toHaveBeenCalledWith(relationId);
    });

    it('GIVEN relation with null details WHEN finding institution-product relation THEN should return relation with null details', async () => {
      // GIVEN
      const relationWithNullDetails = {
        ...mockInstitutionProduct,
        details: null,
      };
      repository.findById.mockResolvedValue(relationWithNullDetails as any);

      // WHEN
      const result = await useCase.execute('relation-uuid');

      // THEN
      expect(repository.findById).toHaveBeenCalledWith('relation-uuid');
      expect(result.details).toBeNull();
      expect(result.product).toBeDefined();
      expect(result.institution).toBeDefined();
    });

    it('GIVEN relation with GENERIC flag WHEN finding institution-product relation THEN should return correct flag and details', async () => {
      // GIVEN
      const genericRelation = {
        ...mockInstitutionProduct,
        flag: ProductFlag.GENERIC,
        details: {
          event_id: 'event-123',
          minPhoto: 10,
          maxPhoto: 100,
          valorPhoto: 5.0,
        },
      };
      repository.findById.mockResolvedValue(genericRelation as any);

      // WHEN
      const result = await useCase.execute('relation-uuid');

      // THEN
      expect(repository.findById).toHaveBeenCalledWith('relation-uuid');
      expect(result.flag).toBe(ProductFlag.GENERIC);
      expect(result.details).toEqual(genericRelation.details);
    });

    it('GIVEN relation with DIGITAL_FILES flag WHEN finding institution-product relation THEN should return correct flag and details', async () => {
      // GIVEN
      const digitalFilesRelation = {
        ...mockInstitutionProduct,
        flag: ProductFlag.DIGITAL_FILES,
        details: {
          isAvailableUnit: true,
          minPhotos: 20,
          valorPhoto: 3.5,
          eventId: 'event-456',
        },
      };
      repository.findById.mockResolvedValue(digitalFilesRelation as any);

      // WHEN
      const result = await useCase.execute('relation-uuid');

      // THEN
      expect(repository.findById).toHaveBeenCalledWith('relation-uuid');
      expect(result.flag).toBe(ProductFlag.DIGITAL_FILES);
      expect(result.details).toEqual(digitalFilesRelation.details);
    });
  });
});
