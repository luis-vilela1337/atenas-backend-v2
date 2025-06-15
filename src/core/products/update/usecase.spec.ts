import { Test, TestingModule } from '@nestjs/testing';
import { UpdateInstitutionProductUseCase } from './usecase';
import { InstitutionProductSQLRepository } from '@infrastructure/data/sql/repositories/institution-product.repostitoy';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductFlag } from '@infrastructure/data/sql/types/product-flag.enum';
import { ProductDetailsAdapter } from '@core/institution-products/adapter';

describe('UpdateInstitutionProductUseCase', () => {
  let useCase: UpdateInstitutionProductUseCase;
  let repository: jest.Mocked<InstitutionProductSQLRepository>;

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      updateInstitutionProduct: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateInstitutionProductUseCase,
        {
          provide: InstitutionProductSQLRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateInstitutionProductUseCase>(
      UpdateInstitutionProductUseCase,
    );
    repository = module.get(InstitutionProductSQLRepository);
  });

  describe('execute', () => {
    const mockExistingRelation = {
      id: 'relation-uuid',
      flag: ProductFlag.ALBUM,
      details: {
        minPhoto: 5,
        maxPhoto: 50,
        valorEncadernacao: 25.99,
        valorFoto: 2.5,
      },
      product: {
        id: 'product-uuid',
        name: 'Test Product',
        flag: ProductFlag.ALBUM,
      },
      institution: {
        id: 'institution-uuid',
        name: 'Test Institution',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockUpdateInput = {
      details: {
        minPhoto: 10,
        maxPhoto: 100,
        valorEncadernacao: 35.99,
        valorFoto: 3.5,
      },
    };

    let toTypedDetailsSpy: jest.SpyInstance;

    beforeEach(() => {
      toTypedDetailsSpy = jest.spyOn(ProductDetailsAdapter, 'toTypedDetails');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('GIVEN valid relation ID and details WHEN updating institution-product details THEN should update successfully', async () => {
      // GIVEN
      repository.findById.mockResolvedValue(mockExistingRelation as any);
      toTypedDetailsSpy.mockReturnValue(mockUpdateInput.details as any);
      const updatedRelation = {
        ...mockExistingRelation,
        details: mockUpdateInput.details,
        updatedAt: new Date(),
      };
      repository.updateInstitutionProduct.mockResolvedValue(
        updatedRelation as any,
      );

      // WHEN
      const result = await useCase.execute('relation-uuid', mockUpdateInput);

      // THEN
      expect(repository.findById).toHaveBeenCalledWith('relation-uuid');
      expect(toTypedDetailsSpy).toHaveBeenCalledWith(
        ProductFlag.ALBUM,
        mockUpdateInput.details,
      );
      expect(repository.updateInstitutionProduct).toHaveBeenCalledWith(
        'relation-uuid',
        { details: mockUpdateInput.details },
      );
      expect(result).toEqual(updatedRelation);
      expect(result.flag).toBe(ProductFlag.ALBUM); // Flag should remain unchanged
    });

    it('GIVEN non-existent relation ID WHEN updating institution-product details THEN should throw NotFoundException', async () => {
      // GIVEN
      const nonExistentId = 'non-existent-uuid';
      repository.findById.mockResolvedValue(null);

      // WHEN & THEN
      await expect(
        useCase.execute(nonExistentId, mockUpdateInput),
      ).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith(nonExistentId);
      expect(repository.updateInstitutionProduct).not.toHaveBeenCalled();
    });

    it('GIVEN invalid details format WHEN updating institution-product details THEN should throw BadRequestException', async () => {
      // GIVEN
      repository.findById.mockResolvedValue(mockExistingRelation as any);
      const invalidInput = {
        details: {
          invalidField: 'invalid value',
        },
      };
      toTypedDetailsSpy.mockImplementation(() => {
        throw new Error(
          'Missing required fields for ALBUM: minPhoto, maxPhoto, valorEncadernacao, valorFoto',
        );
      });

      // WHEN & THEN
      await expect(
        useCase.execute('relation-uuid', invalidInput),
      ).rejects.toThrow(BadRequestException);
      expect(repository.findById).toHaveBeenCalledWith('relation-uuid');
      expect(toTypedDetailsSpy).toHaveBeenCalledWith(
        ProductFlag.ALBUM,
        invalidInput.details,
      );
      expect(repository.updateInstitutionProduct).not.toHaveBeenCalled();
    });

    it('GIVEN null details WHEN updating institution-product details THEN should update with null details', async () => {
      // GIVEN
      repository.findById.mockResolvedValue(mockExistingRelation as any);
      const nullDetailsInput = { details: null };
      const updatedRelation = {
        ...mockExistingRelation,
        details: null,
        updatedAt: new Date(),
      };
      repository.updateInstitutionProduct.mockResolvedValue(
        updatedRelation as any,
      );

      // WHEN
      const result = await useCase.execute('relation-uuid', nullDetailsInput);

      // THEN
      expect(repository.findById).toHaveBeenCalledWith('relation-uuid');
      expect(repository.updateInstitutionProduct).toHaveBeenCalledWith(
        'relation-uuid',
        { details: null },
      );
      expect(result.details).toBeNull();
      expect(result.flag).toBe(ProductFlag.ALBUM); // Flag should remain unchanged
    });

    it('GIVEN repository update failure WHEN updating institution-product details THEN should throw BadRequestException', async () => {
      // GIVEN
      repository.findById.mockResolvedValue(mockExistingRelation as any);
      toTypedDetailsSpy.mockReturnValue(mockUpdateInput.details as any);
      repository.updateInstitutionProduct.mockResolvedValue(null);

      // WHEN & THEN
      await expect(
        useCase.execute('relation-uuid', mockUpdateInput),
      ).rejects.toThrow(BadRequestException);
      expect(repository.findById).toHaveBeenCalledWith('relation-uuid');
      expect(repository.updateInstitutionProduct).toHaveBeenCalledWith(
        'relation-uuid',
        { details: mockUpdateInput.details },
      );
    });

    it('GIVEN GENERIC flag relation WHEN updating with valid generic details THEN should update successfully', async () => {
      // GIVEN
      const genericRelation = {
        ...mockExistingRelation,
        flag: ProductFlag.GENERIC,
        details: {
          event_id: 'event-123',
          minPhoto: 10,
          maxPhoto: 100,
          valorPhoto: 5.0,
        },
      };
      const genericUpdateInput = {
        details: {
          event_id: 'updated-event-456',
          minPhoto: 15,
          maxPhoto: 150,
          valorPhoto: 7.5,
        },
      };
      repository.findById.mockResolvedValue(genericRelation as any);
      toTypedDetailsSpy.mockReturnValue(genericUpdateInput.details as any);
      const updatedGenericRelation = {
        ...genericRelation,
        details: genericUpdateInput.details,
      };
      repository.updateInstitutionProduct.mockResolvedValue(
        updatedGenericRelation as any,
      );

      // WHEN
      const result = await useCase.execute('relation-uuid', genericUpdateInput);

      // THEN
      expect(toTypedDetailsSpy).toHaveBeenCalledWith(
        ProductFlag.GENERIC,
        genericUpdateInput.details,
      );
      expect(result.flag).toBe(ProductFlag.GENERIC);
      expect(result.details).toEqual(genericUpdateInput.details);
    });

    it('GIVEN DIGITAL_FILES flag relation WHEN updating with valid digital files details THEN should update successfully', async () => {
      // GIVEN
      const digitalFilesRelation = {
        ...mockExistingRelation,
        flag: ProductFlag.DIGITAL_FILES,
        details: {
          isAvailableUnit: true,
          minPhotos: 20,
          valorPhoto: 3.5,
          eventId: 'event-456',
        },
      };
      const digitalFilesUpdateInput = {
        details: {
          isAvailableUnit: false,
          minPhotos: 25,
          valorPhoto: 4.0,
          eventId: 'updated-event-789',
        },
      };
      repository.findById.mockResolvedValue(digitalFilesRelation as any);
      toTypedDetailsSpy.mockReturnValue(digitalFilesUpdateInput.details as any);
      const updatedDigitalFilesRelation = {
        ...digitalFilesRelation,
        details: digitalFilesUpdateInput.details,
      };
      repository.updateInstitutionProduct.mockResolvedValue(
        updatedDigitalFilesRelation as any,
      );

      // WHEN
      const result = await useCase.execute(
        'relation-uuid',
        digitalFilesUpdateInput,
      );

      // THEN
      expect(toTypedDetailsSpy).toHaveBeenCalledWith(
        ProductFlag.DIGITAL_FILES,
        digitalFilesUpdateInput.details,
      );
      expect(result.flag).toBe(ProductFlag.DIGITAL_FILES);
      expect(result.details).toEqual(digitalFilesUpdateInput.details);
    });
  });
});
