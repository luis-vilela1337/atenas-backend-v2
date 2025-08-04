import { Injectable, Logger, Inject } from '@nestjs/common';
import { CreateOrderUseCase } from '@core/orders/create-order/usecase';
import { OrderRepositoryInterface } from '@core/orders/repositories/order.repository.interface';
import { MercadoPagoRepositoryInterface } from '@core/mercado-pago/repositories/mercado-pago.repository.interface';
import {
  CreateOrderInput,
  CreateOrderResult,
} from '@core/orders/entities/order.entity';

@Injectable()
export class CreateOrderApplication {
  private readonly logger = new Logger(CreateOrderApplication.name);
  private readonly createOrderUseCase: CreateOrderUseCase;

  constructor(
    @Inject('OrderRepositoryInterface')
    private readonly orderRepository: OrderRepositoryInterface,
    @Inject('MercadoPagoRepositoryInterface')
    private readonly mercadoPagoRepository: MercadoPagoRepositoryInterface,
  ) {
    this.createOrderUseCase = new CreateOrderUseCase(
      orderRepository,
      mercadoPagoRepository,
    );
  }

  async execute(input: CreateOrderInput): Promise<CreateOrderResult> {
    this.logger.log(`Creating order for user: ${input.userId}`);

    try {
      const result = await this.createOrderUseCase.execute(input);

      this.logger.log(`Order created successfully: ${result.orderId}`);

      return result;
    } catch (error) {
      this.logger.error(`Error creating order: ${error.message}`, error.stack);
      throw error;
    }
  }
}
