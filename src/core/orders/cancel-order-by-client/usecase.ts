import { Injectable, Inject } from '@nestjs/common';
import {
  OrderRepositoryInterface,
  CancelOrderResult,
} from '../repositories/order.repository.interface';

export interface CancelOrderByClientInput {
  orderId: string;
  userId: string;
}

@Injectable()
export class CancelOrderByClientUseCase {
  constructor(
    @Inject('OrderRepositoryInterface')
    private readonly orderRepository: OrderRepositoryInterface,
  ) {}

  async execute(input: CancelOrderByClientInput): Promise<CancelOrderResult> {
    return await this.orderRepository.cancelOrderAtomically(
      input.orderId,
      input.userId,
    );
  }
}
