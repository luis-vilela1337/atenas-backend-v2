import { ProductDto } from '@presentation/products/dto/product.dto';
import { PaginatedProductsDto } from '@presentation/products/dto/paginated-products.dto';
import { PaginationMetaDto } from '@presentation/user/dto/pagination-meta.dto';
import { Product } from '@infrastructure/data/sql/entities/products.entity';
import { PaginatedProductsEntity } from '@core/products/dto/paginated-products.dto';

export class ProductMapper {
  static toDto(product: Product): ProductDto {
    return {
      id: product.id,
      name: product.name,
      flag: product.flag,
      description: product.description,
      photos: product.photos || [],
      video: product.video || [],
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    };
  }

  static toDtoArray(products: Product[]): ProductDto[] {
    return products.map((product) => this.toDto(product));
  }

  static toPaginatedDto(
    useCaseResult: PaginatedProductsEntity,
  ): PaginatedProductsDto {
    const paginationMeta: PaginationMetaDto = {
      total: useCaseResult.total,
      totalPages: useCaseResult.totalPages,
      page: useCaseResult.currentPage,
      limit: useCaseResult.limit,
    };

    return {
      data: this.toDtoArray(useCaseResult.products),
      pagination: paginationMeta,
    };
  }
}
