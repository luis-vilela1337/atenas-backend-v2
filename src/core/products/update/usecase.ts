import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductSQLRepository } from '@infrastructure/data/sql/repositories/products.repository';
import { UpdateProductInputDto } from '@presentation/products/dto/update-product.dto';
import { Product } from '@infrastructure/data/sql/entities/products.entity';

@Injectable()
export class UpdateProductUseCase {
  constructor(private readonly productRepository: ProductSQLRepository) {}

  async execute(id: string, input: UpdateProductInputDto): Promise<Product> {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Check if another product already has this name (excluding current product)
    const existingProductWithName = await this.productRepository.findByName(
      input.name,
    );
    if (
      existingProductWithName &&
      existingProductWithName.id !== existingProduct.id
    ) {
      throw new BadRequestException('Já existe um produto com este nome');
    }

    const updateData: Partial<Product> = {
      name: input.name.trim(),
      description: input.description?.trim() || null,
      photos: input.photos || [],
      video: input.video || [],
    };

    const updatedProduct = await this.productRepository.updateProduct(
      id,
      updateData,
    );

    if (!updatedProduct) {
      throw new BadRequestException('Failed to update product');
    }

    return updatedProduct;
  }
}
