import { Injectable } from '@nestjs/common';
import { FindAllProductsUseCase } from '@core/products/find-all/usecase';
import { ListProductsQueryDto } from '@presentation/products/dto/list-products-query.dto';
import { PaginatedProductsDto } from '@presentation/products/dto/paginated-products.dto';
import { ProductMapper } from './adapters/product.mapper';

@Injectable()
export class FindAllProductsApplication {
  constructor(
    private readonly findAllProductsUseCase: FindAllProductsUseCase,
  ) {}

  async execute(input: ListProductsQueryDto): Promise<PaginatedProductsDto> {
    const useCaseResult = await this.findAllProductsUseCase.execute(input);
    return ProductMapper.toPaginatedDto(useCaseResult);
  }
}
