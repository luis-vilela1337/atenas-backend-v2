import { Injectable } from '@nestjs/common';
import { CreateProductUseCase } from '@core/products/create/usecase';
import {
  CreateProductInputDto,
  CreateProductResponseDto,
} from '@presentation/products/dto/create-product.dto';
import { CreateProductAdapter } from './adapters/create-product.adapter';

@Injectable()
export class CreateProductApplication {
  constructor(private readonly createProductUseCase: CreateProductUseCase) {}

  async execute(
    input: CreateProductInputDto,
  ): Promise<CreateProductResponseDto> {
    try {
      const product = await this.createProductUseCase.execute(input);
      return CreateProductAdapter.toResponseDto(product);
    } catch (error) {
      throw error;
    }
  }
}
