import { Injectable, Inject } from '@nestjs/common';
import { OrderRepositoryInterface } from './repositories/order.repository.interface';
import { FindOrdersInput, FindOrdersResult } from './dto/find-orders.dto';

@Injectable()
export class FindOrdersUseCase {
  constructor(
    @Inject('OrderRepositoryInterface')
    private readonly orderRepository: OrderRepositoryInterface,
  ) {}

  async execute(input: FindOrdersInput): Promise<FindOrdersResult> {
    return await this.orderRepository.findOrdersWithPagination(input);
  }
}
