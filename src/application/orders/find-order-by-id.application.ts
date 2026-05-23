import { Injectable } from '@nestjs/common';
import { FindOrderByIdUseCase } from '@core/orders/find-order-by-id.usecase';
import { OrderDto } from '@presentation/orders/dto/order-response.dto';
import { OrderAdapter } from './adapters/order.adapter';
import { ImageStorageService } from '@infrastructure/services/image-storage.service';
import { MercadoPagoService } from '@infrastructure/services/mercado-pago.service';
import { UserSQLRepository } from '@infrastructure/data/sql/repositories/user.repository';
import { OrderStatus } from '@core/orders/entities/order.entity';

@Injectable()
export class FindOrderByIdApplication {
  constructor(
    private readonly findOrderByIdUseCase: FindOrderByIdUseCase,
    private readonly imageStorageService: ImageStorageService,
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly userRepository: UserSQLRepository,
  ) {}

  async execute(id: string): Promise<OrderDto | null> {
    const order = await this.findOrderByIdUseCase.execute(id);

    if (!order) {
      return null;
    }

    let checkoutUrl: string | undefined;
    if (order.paymentStatus === OrderStatus.PENDING && order.paymentGatewayId) {
      checkoutUrl =
        (await this.mercadoPagoService.getPreferenceCheckoutUrl(
          order.paymentGatewayId,
        )) || undefined;
    }

    const user = await this.userRepository.findById(order.userId);
    const studentName = user?.name;

    return OrderAdapter.toOrderDto(
      order,
      this.imageStorageService,
      checkoutUrl,
      studentName,
    );
  }
}
