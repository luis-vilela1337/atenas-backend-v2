import { Injectable } from '@nestjs/common';
import { ProductSQLRepository } from '@infrastructure/data/sql/repositories/products.repository';
import { ListProductsQueryDto } from '@presentation/products/dto/list-products-query.dto';
import { PaginatedProductsEntity } from '../dto/paginated-products.dto';
import { ImageStorageService } from '@infrastructure/services/image-storage.service';
import { Product } from '@infrastructure/data/sql/entities/products.entity';
import { ProductFlag } from '@infrastructure/data/sql/types/product-flag.enum';

@Injectable()
export class FindAllProductsUseCase {
  constructor(
    private readonly productRepository: ProductSQLRepository,
    private readonly imageStorageService: ImageStorageService,
  ) {}

  async execute(input: ListProductsQueryDto): Promise<PaginatedProductsEntity> {
    const {
      page = 1,
      limit = 10,
      search,
      flag,
      sortBy,
      order = 'desc',
    } = input;

    const filters: any = {};

    if (flag) {
      filters.flag = flag as ProductFlag;
    }

    if (search) {
      filters.search = search;
    }

    const result = await this.productRepository.findAllPaginated(
      page,
      limit,
      filters,
    );

    if (sortBy && result.products.length > 0) {
      result.products = this.sortProducts(
        result.products,
        sortBy,
        order as 'asc' | 'desc',
      );
    }

    // Generate signed URLs for photos and videos
    await Promise.all(
      result.products.map(async (product) => {
        if (product.photos && product.photos.length > 0) {
          product.photos = await Promise.all(
            product.photos.map(
              async (photo) =>
                await this.imageStorageService.generateSignedUrl(photo, 'read'),
            ),
          );
        }

        if (product.video && product.video.length > 0) {
          product.video = await Promise.all(
            product.video.map(
              async (video) =>
                await this.imageStorageService.generateSignedUrl(video, 'read'),
            ),
          );
        }
      }),
    );

    return new PaginatedProductsEntity({
      products: result.products,
      total: result.total,
      totalPages: result.totalPages,
      currentPage: page,
      limit,
    });
  }

  private sortProducts(
    products: Product[],
    sortBy: string,
    order: 'asc' | 'desc',
  ): Product[] {
    return products.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (sortBy) {
        case 'name':
          valueA = a.name?.toLowerCase() || '';
          valueB = b.name?.toLowerCase() || '';
          break;
        case 'created_at':
          valueA = new Date(a.created_at);
          valueB = new Date(b.created_at);
          break;
        case 'updated_at':
          valueA = new Date(a.updated_at);
          valueB = new Date(b.updated_at);
          break;
        default:
          return 0;
      }

      if (valueA < valueB) {
        return order === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
}
