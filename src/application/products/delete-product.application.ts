import { Injectable } from '@nestjs/common';
import { DeleteProductUseCase } from '@core/products/delete/usecase';

@Injectable()
export class DeleteProductApplication {
  constructor(private readonly deleteProductUseCase: DeleteProductUseCase) {}

  async execute(id: string): Promise<void> {
    try {
      return await this.deleteProductUseCase.execute(id);
    } catch (e) {
      throw e;
    }
  }
}
