import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductSQLRepository } from '@infrastructure/data/sql/repositories/products.repository';

@Injectable()
export class DeleteProductUseCase {
  constructor(private readonly productRepository: ProductSQLRepository) {}

  async execute(id: string): Promise<void> {
    const existingProduct = await this.productRepository.findById(id);

    if (!existingProduct) {
      throw new NotFoundException('Produto não encontrado');
    }

    await this.productRepository.hardDelete(id);
  }
}
