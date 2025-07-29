import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProductUseCase } from './usecase';
import { ProductSQLRepository } from '@infrastructure/data/sql/repositories/products.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductFlag } from '@infrastructure/data/sql/types/product-flag.enum';
import { ImageStorageService } from '@infrastructure/services/image-storage.service';

describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;
  let repository: jest.Mocked<ProductSQLRepository>;

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      updateProduct: jest.fn(),
    };

    const mockImageStorageService = {
      processProfileImageInput: jest.fn((input) => input),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProductUseCase,
        {
          provide: ProductSQLRepository,
          useValue: mockRepository,
        },
        {
          provide: ImageStorageService,
          useValue: mockImageStorageService,
        },
      ],
    }).compile();

    useCase = module.get<UpdateProductUseCase>(UpdateProductUseCase);
    repository = module.get(ProductSQLRepository);
  });

  describe('execute', () => {
    const mockExistingProduct = {
      id: 'product-uuid',
      name: 'Original Product',
      flag: ProductFlag.GENERIC,
      description: 'Original description',
      photos: ['photo1.jpg'],
      video: ['video1.mp4'],
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockUpdateInput = {
      name: 'Updated Product',
      description: 'Updated description',
      photos: ['photo2.jpg', 'photo3.jpg'],
      video: ['video2.mp4'],
    };

    it('GIVEN valid product ID and input WHEN updating product THEN should update successfully', async () => {
      // GIVEN
      repository.findById.mockResolvedValue(mockExistingProduct as any);
      repository.findByName.mockResolvedValue(null);
      const updatedProduct = {
        ...mockExistingProduct,
        ...mockUpdateInput,
        name: mockUpdateInput.name.trim(),
        description: mockUpdateInput.description.trim(),
        updated_at: new Date(),
      };
      repository.updateProduct.mockResolvedValue(updatedProduct as any);

      // WHEN
      const result = await useCase.execute('product-uuid', mockUpdateInput);

      // THEN
      expect(repository.findById).toHaveBeenCalledWith('product-uuid');
      expect(repository.findByName).toHaveBeenCalledWith(mockUpdateInput.name);
      expect(repository.updateProduct).toHaveBeenCalledWith('product-uuid', {
        name: mockUpdateInput.name.trim(),
        description: mockUpdateInput.description.trim(),
        photos: mockUpdateInput.photos,
        video: mockUpdateInput.video,
      });
      expect(result).toEqual(updatedProduct);
      expect(result.flag).toBe(ProductFlag.GENERIC); // Flag should remain unchanged
    });

    it('GIVEN non-existent product ID WHEN updating product THEN should throw NotFoundException', async () => {
      // GIVEN
      const nonExistentId = 'non-existent-uuid';
      repository.findById.mockResolvedValue(null);

      // WHEN & THEN
      await expect(
        useCase.execute(nonExistentId, mockUpdateInput),
      ).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith(nonExistentId);
      expect(repository.findByName).not.toHaveBeenCalled();
      expect(repository.updateProduct).not.toHaveBeenCalled();
    });

    it('GIVEN existing product name WHEN updating with duplicate name THEN should throw BadRequestException', async () => {
      // GIVEN
      const anotherProduct = {
        ...mockExistingProduct,
        id: 'another-product-uuid',
        name: mockUpdateInput.name,
      };
      repository.findById.mockResolvedValue(mockExistingProduct as any);
      repository.findByName.mockResolvedValue(anotherProduct as any);

      // WHEN & THEN
      await expect(
        useCase.execute('product-uuid', mockUpdateInput),
      ).rejects.toThrow(BadRequestException);
      expect(repository.findById).toHaveBeenCalledWith('product-uuid');
      expect(repository.findByName).toHaveBeenCalledWith(mockUpdateInput.name);
      expect(repository.updateProduct).not.toHaveBeenCalled();
    });

    it('GIVEN same product updating its own name WHEN updating product THEN should update successfully', async () => {
      // GIVEN
      repository.findById.mockResolvedValue(mockExistingProduct as any);
      repository.findByName.mockResolvedValue(mockExistingProduct as any);
      const updatedProduct = {
        ...mockExistingProduct,
        ...mockUpdateInput,
        name: mockUpdateInput.name.trim(),
      };
      repository.updateProduct.mockResolvedValue(updatedProduct as any);

      // WHEN
      const result = await useCase.execute('product-uuid', mockUpdateInput);

      // THEN
      expect(repository.findById).toHaveBeenCalledWith('product-uuid');
      expect(repository.findByName).toHaveBeenCalledWith(mockUpdateInput.name);
      expect(repository.updateProduct).toHaveBeenCalledWith('product-uuid', {
        name: mockUpdateInput.name.trim(),
        description: mockUpdateInput.description.trim(),
        photos: mockUpdateInput.photos,
        video: mockUpdateInput.video,
      });
      expect(result).toEqual(updatedProduct);
    });

    it('GIVEN null optional fields WHEN updating product THEN should update with null values', async () => {
      // GIVEN
      const inputWithNulls = {
        name: 'Updated Name',
        description: undefined,
        photos: undefined,
        video: undefined,
      };
      repository.findById.mockResolvedValue(mockExistingProduct as any);
      repository.findByName.mockResolvedValue(null);
      const updatedProduct = {
        ...mockExistingProduct,
        name: inputWithNulls.name,
        description: null,
        photos: [],
        video: [],
      };
      repository.updateProduct.mockResolvedValue(updatedProduct as any);

      // WHEN
      const result = await useCase.execute('product-uuid', inputWithNulls);

      // THEN
      expect(repository.updateProduct).toHaveBeenCalledWith('product-uuid', {
        name: inputWithNulls.name.trim(),
        description: null,
        photos: [],
        video: [],
      });
      expect(result.description).toBeNull();
      expect(result.photos).toEqual([]);
      expect(result.video).toEqual([]);
    });

    it('GIVEN repository update failure WHEN updating product THEN should throw BadRequestException', async () => {
      // GIVEN
      repository.findById.mockResolvedValue(mockExistingProduct as any);
      repository.findByName.mockResolvedValue(null);
      repository.updateProduct.mockResolvedValue(null);

      // WHEN & THEN
      await expect(
        useCase.execute('product-uuid', mockUpdateInput),
      ).rejects.toThrow(BadRequestException);
      expect(repository.findById).toHaveBeenCalledWith('product-uuid');
      expect(repository.updateProduct).toHaveBeenCalledWith('product-uuid', {
        name: mockUpdateInput.name.trim(),
        description: mockUpdateInput.description.trim(),
        photos: mockUpdateInput.photos,
        video: mockUpdateInput.video,
      });
    });

    it('GIVEN whitespace in input fields WHEN updating product THEN should trim string fields', async () => {
      // GIVEN
      const inputWithWhitespace = {
        name: '  Product with spaces  ',
        description: '  Description with spaces  ',
        photos: ['photo1.jpg'],
        video: ['video1.mp4'],
      };
      repository.findById.mockResolvedValue(mockExistingProduct as any);
      repository.findByName.mockResolvedValue(null);
      const updatedProduct = {
        ...mockExistingProduct,
        name: 'Product with spaces',
        description: 'Description with spaces',
      };
      repository.updateProduct.mockResolvedValue(updatedProduct as any);

      // WHEN
      const result = await useCase.execute('product-uuid', inputWithWhitespace);

      // THEN
      expect(repository.updateProduct).toHaveBeenCalledWith('product-uuid', {
        name: 'Product with spaces',
        description: 'Description with spaces',
        photos: inputWithWhitespace.photos,
        video: inputWithWhitespace.video,
      });
      expect(result.name).toBe('Product with spaces');
      expect(result.description).toBe('Description with spaces');
    });
  });
});
