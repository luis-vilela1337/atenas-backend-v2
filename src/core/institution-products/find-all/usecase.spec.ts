import { Test, TestingModule } from '@nestjs/testing';
import { FindAllInstitutionProductsUseCase } from './usecase';
import { ProductFlag } from '@infrastructure/data/sql/types/product-flag.enum';
import { ListInstitutionProductsQueryDto } from '@presentation/institution-product/dto/list-all.dto';
import { InstitutionProductSQLRepository } from '@infrastructure/data/sql/repositories/institution-product.repostitoy';

describe('FindAllInstitutionProductsUseCase', () => {
  let useCase: FindAllInstitutionProductsUseCase;
  let repository: jest.Mocked<InstitutionProductSQLRepository>;

  const mockInstitutionProduct = {
    id: 'relation-uuid',
    product: {
      id: 'product-uuid',
      name: 'Test Product',
      flag: ProductFlag.GENERIC,
    },
    institution: {
      id: 'institution-uuid',
      name: 'Test Institution',
      contractNumber: 'CONTRACT-001',
    },
    flag: ProductFlag.GENERIC,
    details: {
      event_id: 'event-123',
      minPhoto: 10,
      maxPhoto: 100,
      valorPhoto: 5.0,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      findAllPaginated: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllInstitutionProductsUseCase,
        {
          provide: InstitutionProductSQLRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindAllInstitutionProductsUseCase>(
      FindAllInstitutionProductsUseCase,
    );
    repository = module.get(InstitutionProductSQLRepository);
  });

  describe('execute', () => {
    it('GIVEN valid pagination input WHEN finding all institution-products THEN should return paginated results', async () => {
      // GIVEN
      const input: ListInstitutionProductsQueryDto = {
        page: 1,
        limit: 10,
      };
      const repositoryResult = {
        institutionProducts: [mockInstitutionProduct],
        total: 1,
        totalPages: 1,
      };

      repository.findAllPaginated.mockResolvedValue(repositoryResult as any);

      // WHEN
      const result = await useCase.execute(input);

      // THEN
      expect(repository.findAllPaginated).toHaveBeenCalledWith(1, 10, {
        productId: undefined,
        institutionId: undefined,
        flag: undefined,
      });
      expect(result.institutionProducts).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.currentPage).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.hasNext).toBeFalsy();
      expect(result.hasPrevious).toBeFalsy();
    });

    it('GIVEN filters WHEN finding all institution-products THEN should apply filters correctly', async () => {
      // GIVEN
      const input: ListInstitutionProductsQueryDto = {
        page: 1,
        limit: 5,
        productId: 'product-uuid',
        institutionId: 'institution-uuid',
        flag: ProductFlag.DIGITAL_FILES,
      };
      const repositoryResult = {
        institutionProducts: [],
        total: 0,
        totalPages: 0,
      };

      repository.findAllPaginated.mockResolvedValue(repositoryResult as any);

      // WHEN
      const result = await useCase.execute(input);

      // THEN
      expect(repository.findAllPaginated).toHaveBeenCalledWith(1, 5, {
        productId: 'product-uuid',
        institutionId: 'institution-uuid',
        flag: ProductFlag.DIGITAL_FILES,
      });
      expect(result.institutionProducts).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('GIVEN no page and limit WHEN finding all institution-products THEN should use default values', async () => {
      // GIVEN
      const input: ListInstitutionProductsQueryDto = {};
      const repositoryResult = {
        institutionProducts: [mockInstitutionProduct],
        total: 25,
        totalPages: 3,
      };

      repository.findAllPaginated.mockResolvedValue(repositoryResult as any);

      // WHEN
      const result = await useCase.execute(input);

      // THEN
      expect(repository.findAllPaginated).toHaveBeenCalledWith(1, 10, {
        productId: undefined,
        institutionId: undefined,
        flag: undefined,
      });
      expect(result.currentPage).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.hasNext).toBeTruthy();
      expect(result.hasPrevious).toBeFalsy();
    });

    it('GIVEN middle page WHEN finding all institution-products THEN should set hasNext and hasPrevious correctly', async () => {
      // GIVEN
      const input: ListInstitutionProductsQueryDto = {
        page: 2,
        limit: 10,
      };
      const repositoryResult = {
        institutionProducts: [mockInstitutionProduct],
        total: 30,
        totalPages: 3,
      };

      repository.findAllPaginated.mockResolvedValue(repositoryResult as any);

      // WHEN
      const result = await useCase.execute(input);

      // THEN
      expect(result.currentPage).toBe(2);
      expect(result.totalPages).toBe(3);
      expect(result.hasNext).toBeTruthy();
      expect(result.hasPrevious).toBeTruthy();
    });

    it('GIVEN last page WHEN finding all institution-products THEN should set hasNext to false', async () => {
      // GIVEN
      const input: ListInstitutionProductsQueryDto = {
        page: 3,
        limit: 10,
      };
      const repositoryResult = {
        institutionProducts: [mockInstitutionProduct],
        total: 30,
        totalPages: 3,
      };

      repository.findAllPaginated.mockResolvedValue(repositoryResult as any);

      // WHEN
      const result = await useCase.execute(input);

      // THEN
      expect(result.currentPage).toBe(3);
      expect(result.hasNext).toBeFalsy();
      expect(result.hasPrevious).toBeTruthy();
    });

    it('GIVEN repository error WHEN finding all institution-products THEN should propagate error', async () => {
      // GIVEN
      const input: ListInstitutionProductsQueryDto = { page: 1, limit: 10 };
      const repositoryError = new Error('Database connection error');
      repository.findAllPaginated.mockRejectedValue(repositoryError);

      // WHEN & THEN
      await expect(useCase.execute(input)).rejects.toThrow(repositoryError);
      expect(repository.findAllPaginated).toHaveBeenCalledWith(1, 10, {
        productId: undefined,
        institutionId: undefined,
        flag: undefined,
      });
    });
  });
});
