import { Product } from '@infrastructure/data/sql/entities/products.entity';
import { CreateProductResponseDto } from '@presentation/products/dto/create-product.dto';

export class CreateProductAdapter {
  static toResponseDto(product: Product): CreateProductResponseDto {
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
