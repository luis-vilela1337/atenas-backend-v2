import { Injectable } from '@nestjs/common';
import { UpdateOrderStatusUseCase } from '@core/orders/update-order-status/usecase';
import { OrderStatus } from '@core/orders/entities/order.entity';

export interface UpdateOrderStatusApplicationInput {
  orderId: string;
  status: OrderStatus;
}

export interface UpdateOrderStatusApplicationResult {
  message: string;
  orderId: string;
  status: OrderStatus;
}

@Injectable()
export class UpdateOrderStatusApplication {
  constructor(
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
  ) {}

  async execute(
    input: UpdateOrderStatusApplicationInput,
  ): Promise<UpdateOrderStatusApplicationResult> {
    await this.updateOrderStatusUseCase.execute({
      orderId: input.orderId,
      paymentStatus: input.status,
    });

    return {
      message: 'Status do pedido atualizado com sucesso',
      orderId: input.orderId,
      status: input.status,
    };
  }
}
