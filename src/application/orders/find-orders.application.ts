import { Injectable } from '@nestjs/common';
import { FindOrdersUseCase } from '@core/orders/find-orders.usecase';
import { ListOrdersQueryDto } from '@presentation/orders/dto/list-orders-query.dto';
import { OrderListResponseDto } from '@presentation/orders/dto/order-list-response.dto';
import { OrderAdapter } from './adapters/order.adapter';

@Injectable()
export class FindOrdersApplication {
  constructor(private readonly findOrdersUseCase: FindOrdersUseCase) {}

  async execute(query: ListOrdersQueryDto): Promise<OrderListResponseDto> {
    const input = OrderAdapter.toFindOrdersInput(query);
    const result = await this.findOrdersUseCase.execute(input);
    return OrderAdapter.toOrderListResponseDto(result);
  }
}
