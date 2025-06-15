import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductSQLRepository } from '@infrastructure/data/sql/repositories/products.repository';
import { Product } from '@infrastructure/data/sql/entities/products.entity';
import { CreateProductInputDto } from '@presentation/products/dto/create-product.dto';
import { ProductFlag } from '@infrastructure/data/sql/types/product-flag.enum';

@Injectable()
export class CreateProductUseCase {
  constructor(private readonly productRepository: ProductSQLRepository) {}

  async execute(input: CreateProductInputDto): Promise<Product> {
    const existingProduct = await this.productRepository.findByName(input.name);
    if (existingProduct) {
      throw new BadRequestException('Já existe um produto com este nome');
    }

    const productData: Partial<Product> = {
      name: input.name.trim(),
      flag: input.flag || ProductFlag.GENERIC,
      description: input.description?.trim() || null,
      photos: input.photos || [],
      video: input.video || [],
    };

    const savedProduct = await this.productRepository.createProduct(
      productData,
    );

    const fullProduct = await this.productRepository.findById(savedProduct.id);

    if (!fullProduct) {
      throw new BadRequestException('Erro ao recuperar produto criado');
    }

    return fullProduct;
  }
}
