import { Test, TestingModule } from '@nestjs/testing';
import { CreateInstitutionProductUseCase } from './usecase';
import { ProductSQLRepository } from '@infrastructure/data/sql/repositories/products.repository';
import { InstitutionSQLRepository } from '@infrastructure/data/sql/repositories/institution.repository';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ProductFlag } from '@infrastructure/data/sql/types/product-flag.enum';
import { InstitutionProductSQLRepository } from '@infrastructure/data/sql/repositories/institution-product.repostitoy';
import { ProductDetailsAdapter } from '@core/institution-products/adapter';

describe('CreateInstitutionProductUseCase', () => {
  let useCase: CreateInstitutionProductUseCase;
  let institutionProductRepo: jest.Mocked<InstitutionProductSQLRepository>;
  let productRepo: jest.Mocked<ProductSQLRepository>;
  let institutionRepo: jest.Mocked<InstitutionSQLRepository>;

  beforeEach(async () => {
    const mockInstitutionProductRepo = {
      findByProductAndInstitution: jest.fn(),
      createInstitutionProduct: jest.fn(),
      findById: jest.fn(),
    };

    const mockProductRepo = {
      findById: jest.fn(),
    };

    const mockInstitutionRepo = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateInstitutionProductUseCase,
        {
          provide: InstitutionProductSQLRepository,
          useValue: mockInstitutionProductRepo,
        },
        { provide: ProductSQLRepository, useValue: mockProductRepo },
        { provide: InstitutionSQLRepository, useValue: mockInstitutionRepo },
      ],
    }).compile();

    useCase = module.get<CreateInstitutionProductUseCase>(
      CreateInstitutionProductUseCase,
    );
    institutionProductRepo = module.get(InstitutionProductSQLRepository);
    productRepo = module.get(ProductSQLRepository);
    institutionRepo = module.get(InstitutionSQLRepository);
  });

  describe('execute', () => {
    const mockInput = {
      productId: 'product-uuid',
      institutionId: 'institution-uuid',
      flag: ProductFlag.ALBUM,
      details: {
        minPhoto: 5,
        maxPhoto: 50,
        valorEncadernacao: 25.99,
        valorFoto: 2.5,
      },
    };

    const mockProduct = {
      id: 'product-uuid',
      name: 'Test Product',
      flag: ProductFlag.ALBUM,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockInstitution = {
      id: 'institution-uuid',
      name: 'Test Institution',
      contractNumber: 'CONTRACT001',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockCreatedRelation = {
      id: 'relation-uuid',
      product: mockProduct,
      institution: mockInstitution,
      flag: ProductFlag.ALBUM,
      details: mockInput.details,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let toTypedDetailsSpy: jest.SpyInstance;

    beforeEach(() => {
      toTypedDetailsSpy = jest.spyOn(ProductDetailsAdapter, 'toTypedDetails');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('GIVEN valid input and no existing relation WHEN creating institution-product relation THEN should create successfully', async () => {
      // GIVEN
      productRepo.findById.mockResolvedValue(mockProduct as any);
      institutionRepo.findById.mockResolvedValue(mockInstitution as any);
      institutionProductRepo.findByProductAndInstitution.mockResolvedValue(
        null,
      );
      toTypedDetailsSpy.mockReturnValue(mockInput.details as any);
      institutionProductRepo.createInstitutionProduct.mockResolvedValue(
        mockCreatedRelation as any,
      );
      institutionProductRepo.findById.mockResolvedValue(
        mockCreatedRelation as any,
      );

      // WHEN
      const result = await useCase.execute(mockInput);

      // THEN
      expect(productRepo.findById).toHaveBeenCalledWith(mockInput.productId);
      expect(institutionRepo.findById).toHaveBeenCalledWith(
        mockInput.institutionId,
      );
      expect(
        institutionProductRepo.findByProductAndInstitution,
      ).toHaveBeenCalledWith(mockInput.productId, mockInput.institutionId);
      expect(toTypedDetailsSpy).toHaveBeenCalledWith(
        mockInput.flag,
        mockInput.details,
      );
      expect(
        institutionProductRepo.createInstitutionProduct,
      ).toHaveBeenCalledWith({
        productId: mockInput.productId,
        institutionId: mockInput.institutionId,
        flag: mockInput.flag,
        details: mockInput.details,
      });
      expect(result).toEqual(mockCreatedRelation);
    });

    it('GIVEN non-existent product WHEN creating relation THEN should throw NotFoundException', async () => {
      // GIVEN
      productRepo.findById.mockResolvedValue(null);

      // WHEN & THEN
      await expect(useCase.execute(mockInput)).rejects.toThrow(
        NotFoundException,
      );
      expect(productRepo.findById).toHaveBeenCalledWith(mockInput.productId);
      expect(institutionRepo.findById).not.toHaveBeenCalled();
      expect(
        institutionProductRepo.createInstitutionProduct,
      ).not.toHaveBeenCalled();
    });

    it('GIVEN non-existent institution WHEN creating relation THEN should throw NotFoundException', async () => {
      // GIVEN
      productRepo.findById.mockResolvedValue(mockProduct as any);
      institutionRepo.findById.mockResolvedValue(null);

      // WHEN & THEN
      await expect(useCase.execute(mockInput)).rejects.toThrow(
        NotFoundException,
      );
      expect(productRepo.findById).toHaveBeenCalledWith(mockInput.productId);
      expect(institutionRepo.findById).toHaveBeenCalledWith(
        mockInput.institutionId,
      );
      expect(
        institutionProductRepo.createInstitutionProduct,
      ).not.toHaveBeenCalled();
    });

    it('GIVEN existing relation WHEN creating relation THEN should throw ConflictException', async () => {
      // GIVEN
      productRepo.findById.mockResolvedValue(mockProduct as any);
      institutionRepo.findById.mockResolvedValue(mockInstitution as any);
      institutionProductRepo.findByProductAndInstitution.mockResolvedValue(
        mockCreatedRelation as any,
      );

      // WHEN & THEN
      await expect(useCase.execute(mockInput)).rejects.toThrow(
        ConflictException,
      );
      expect(
        institutionProductRepo.findByProductAndInstitution,
      ).toHaveBeenCalledWith(mockInput.productId, mockInput.institutionId);
      expect(
        institutionProductRepo.createInstitutionProduct,
      ).not.toHaveBeenCalled();
    });

    it('GIVEN creation fails to retrieve relation WHEN creating relation THEN should throw BadRequestException', async () => {
      // GIVEN
      productRepo.findById.mockResolvedValue(mockProduct as any);
      institutionRepo.findById.mockResolvedValue(mockInstitution as any);
      institutionProductRepo.findByProductAndInstitution.mockResolvedValue(
        null,
      );
      toTypedDetailsSpy.mockReturnValue(mockInput.details as any);
      institutionProductRepo.createInstitutionProduct.mockResolvedValue(
        mockCreatedRelation as any,
      );
      institutionProductRepo.findById.mockResolvedValue(null);

      // WHEN & THEN
      await expect(useCase.execute(mockInput)).rejects.toThrow(
        BadRequestException,
      );
      expect(institutionProductRepo.findById).toHaveBeenCalledWith(
        mockCreatedRelation.id,
      );
    });
  });
});
