import { Product } from '@infrastructure/data/sql/entities/products.entity';
import { UpdateProductResponseDto } from '@presentation/products/dto/update-product.dto';

export class UpdateProductAdapter {
  static toResponseDto(product: Product): UpdateProductResponseDto {
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
}
