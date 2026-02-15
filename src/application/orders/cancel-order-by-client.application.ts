import { Injectable } from '@nestjs/common';
import {
  CancelOrderByClientUseCase,
  CancelOrderByClientInput,
} from '@core/orders/cancel-order-by-client/usecase';
import { CancelOrderResult } from '@core/orders/repositories/order.repository.interface';

@Injectable()
export class CancelOrderByClientApplication {
  constructor(
    private readonly cancelOrderByClientUseCase: CancelOrderByClientUseCase,
  ) {}

  async execute(input: CancelOrderByClientInput): Promise<CancelOrderResult> {
    return await this.cancelOrderByClientUseCase.execute(input);
  }
}
