import { Injectable, Inject } from '@nestjs/common';
import { OrderRepositoryInterface } from './repositories/order.repository.interface';
import { Order } from './entities/order.entity';

@Injectable()
export class FindOrderByIdUseCase {
  constructor(
    @Inject('OrderRepositoryInterface')
    private readonly orderRepository: OrderRepositoryInterface,
  ) {}

  async execute(id: string): Promise<Order | null> {
    return await this.orderRepository.findOrderById(id);
  }
}
