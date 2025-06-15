import { Injectable } from '@nestjs/common';
import {
  PaginatedInstitutionProductsEntity
} from '@core/institution-products/dto/paginate-institution-products.entity';
import { ListInstitutionProductsQueryDto } from '@presentation/institution-product/dto/list-all.dto';
import { InstitutionProductSQLRepository } from '@infrastructure/data/sql/repositories/institution-product.repostitoy';

@Injectable()
export class FindAllInstitutionProductsUseCase {
  constructor(
    private readonly institutionProductRepository: InstitutionProductSQLRepository,
  ) {}

  async execute(
    input: ListInstitutionProductsQueryDto,
  ): Promise<PaginatedInstitutionProductsEntity> {
    const result = await this.institutionProductRepository.findAllPaginated(
      input.page || 1,
      input.limit || 10,
      {
        productId: input.productId,
        institutionId: input.institutionId,
        flag: input.flag,
      },
    );

    return new PaginatedInstitutionProductsEntity({
      institutionProducts: result.institutionProducts,
      total: result.total,
      totalPages: result.totalPages,
      currentPage: input.page || 1,
      limit: input.limit || 10,
    });
  }
}
