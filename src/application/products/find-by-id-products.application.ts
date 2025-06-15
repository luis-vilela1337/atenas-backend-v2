import { Injectable } from '@nestjs/common';
import { FindProductByIdUseCase } from '@core/products/find-by-id/usecase';
import { ProductDto } from '@presentation/products/dto/product.dto';
import { ProductMapper } from './adapters/product.mapper';

@Injectable()
export class FindProductByIdApplication {
  constructor(
    private readonly findProductByIdUseCase: FindProductByIdUseCase,
  ) {}

  async execute(id: string): Promise<ProductDto> {
    try {
      const product = await this.findProductByIdUseCase.execute(id);
      return ProductMapper.toDto(product);
    } catch (error) {
      throw error;
    }
  }
}
