import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateOrderUseCase } from '@core/orders/create-order/usecase';
import { OrderRepositoryInterface } from '@core/orders/repositories/order.repository.interface';
import { MercadoPagoRepositoryInterface } from '@core/mercado-pago/repositories/mercado-pago.repository.interface';
import { UserSQLRepository } from '../../infra/data/sql/repositories/user.repository';
import { InstitutionProductSQLRepository } from '../../infra/data/sql/repositories/institution-product.repostitoy';
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
    private readonly userRepository: UserSQLRepository,
    private readonly institutionProductRepository: InstitutionProductSQLRepository,
    private readonly configService: ConfigService,
  ) {
    this.createOrderUseCase = new CreateOrderUseCase(
      orderRepository,
      mercadoPagoRepository,
      userRepository,
      institutionProductRepository,
      configService,
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
