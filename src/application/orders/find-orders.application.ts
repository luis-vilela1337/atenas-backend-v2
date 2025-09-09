import { Injectable } from '@nestjs/common';
import { FindOrdersUseCase } from '@core/orders/find-orders.usecase';
import { ListOrdersQueryDto } from '@presentation/orders/dto/list-orders-query.dto';
import { OrderListResponseDto } from '@presentation/orders/dto/order-list-response.dto';
import { OrderAdapter } from './adapters/order.adapter';
import { ImageStorageService } from '@infrastructure/services/image-storage.service';

@Injectable()
export class FindOrdersApplication {
  constructor(
    private readonly findOrdersUseCase: FindOrdersUseCase,
    private readonly imageStorageService: ImageStorageService,
  ) {}

  async execute(query: ListOrdersQueryDto): Promise<OrderListResponseDto> {
    const input = OrderAdapter.toFindOrdersInput(query);
    const result = await this.findOrdersUseCase.execute(input);
    return OrderAdapter.toOrderListResponseDto(
      result,
      this.imageStorageService,
    );
  }
}
