import { Injectable } from '@nestjs/common';
import { FindOrderByIdUseCase } from '@core/orders/find-order-by-id.usecase';
import { OrderDto } from '@presentation/orders/dto/order-response.dto';
import { OrderAdapter } from './adapters/order.adapter';
import { ImageStorageService } from '@infrastructure/services/image-storage.service';

@Injectable()
export class FindOrderByIdApplication {
  constructor(
    private readonly findOrderByIdUseCase: FindOrderByIdUseCase,
    private readonly imageStorageService: ImageStorageService,
  ) {}

  async execute(id: string): Promise<OrderDto | null> {
    const order = await this.findOrderByIdUseCase.execute(id);

    if (!order) {
      return null;
    }

    return OrderAdapter.toOrderDto(order, this.imageStorageService);
  }
}
