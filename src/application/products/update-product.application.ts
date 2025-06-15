import { Injectable } from '@nestjs/common';
import { UpdateProductUseCase } from '@core/products/update/usecase';
import { UpdateProductAdapter } from './adapters/update-product.adapter';
import {
  UpdateProductInputDto,
  UpdateProductResponseDto,
} from '@presentation/products/dto/update-product.dto';

@Injectable()
export class UpdateProductApplication {
  constructor(private readonly updateProductUseCase: UpdateProductUseCase) {}

  async execute(
    id: string,
    input: UpdateProductInputDto,
  ): Promise<UpdateProductResponseDto> {
    try {
      const updatedProduct = await this.updateProductUseCase.execute(id, input);
      return UpdateProductAdapter.toResponseDto(updatedProduct);
    } catch (error) {
      throw error;
    }
  }
}
