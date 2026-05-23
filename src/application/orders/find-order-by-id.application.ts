import { Inject, Injectable, Logger } from '@nestjs/common';
import { FindOrderByIdUseCase } from '@core/orders/find-order-by-id.usecase';
import { OrderDto } from '@presentation/orders/dto/order-response.dto';
import { OrderAdapter } from './adapters/order.adapter';
import { ImageStorageService } from '@infrastructure/services/image-storage.service';
import { MercadoPagoService } from '@infrastructure/services/mercado-pago.service';
import { UserSQLRepository } from '@infrastructure/data/sql/repositories/user.repository';
import { OrderStatus, PaymentSnapshot } from '@core/orders/entities/order.entity';
import { WebhookRepositoryInterface } from '@core/mercado-pago/repositories/webhook.repository.interface';
import { OrderRepositoryInterface } from '@core/orders/repositories/order.repository.interface';

@Injectable()
export class FindOrderByIdApplication {
  private readonly logger = new Logger(FindOrderByIdApplication.name);

  constructor(
    private readonly findOrderByIdUseCase: FindOrderByIdUseCase,
    private readonly imageStorageService: ImageStorageService,
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly userRepository: UserSQLRepository,
    @Inject('WebhookRepositoryInterface')
    private readonly webhookRepository: WebhookRepositoryInterface,
    @Inject('OrderRepositoryInterface')
    private readonly orderRepository: OrderRepositoryInterface,
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

    if (!order.paymentSnapshot && order.paymentGatewayId) {
      await this.backfillPaymentSnapshot(order);
    }

    const user = await this.userRepository.findById(order.userId);
    const studentName = user?.name;

    if (!order.payerSnapshot && user) {
      order.payerSnapshot = {
        name: user.name,
        email: user.email,
        phone: user.phone || undefined,
      };
    }

    return OrderAdapter.toOrderDto(
      order,
      this.imageStorageService,
      checkoutUrl,
      studentName,
    );
  }

  private async backfillPaymentSnapshot(order: any): Promise<void> {
    try {
      const paymentId = await this.webhookRepository.findPaymentIdByOrderId(
        order.id,
      );

      if (!paymentId) {
        this.logger.debug(
          `No payment ID found for order ${order.id}, skipping backfill`,
        );
        return;
      }

      const details = await this.webhookRepository.getPaymentDetails(
        paymentId,
      );

      const transactionDetails = details?.transaction_details;
      const totalPaid = transactionDetails?.total_paid_amount
        ? Number(transactionDetails.total_paid_amount)
        : undefined;
      const netReceived = transactionDetails?.net_received_amount
        ? Number(transactionDetails.net_received_amount)
        : undefined;

      const snapshot: PaymentSnapshot = {
        paymentId: String(details.id),
        status: details.status,
        statusDetail: details.status_detail,
        methodId: details.payment_method_id ?? undefined,
        methodType: details.payment_type_id ?? undefined,
        installments: details.installments ?? undefined,
        transactionAmount: details.transaction_amount
          ? Number(details.transaction_amount)
          : undefined,
        totalPaidAmount: totalPaid,
        netReceivedAmount: netReceived,
        installmentAmount: transactionDetails?.installment_amount
          ? Number(transactionDetails.installment_amount)
          : undefined,
        payerEmail: details.payer?.email ?? undefined,
        payerCpf:
          details.payer?.identification?.type === 'CPF'
            ? details.payer.identification.number
            : undefined,
      };

      await this.orderRepository.updateOrderPaymentSnapshot(order.id, snapshot);
      order.paymentSnapshot = snapshot;

      this.logger.log(
        `Backfilled payment snapshot for order ${order.id} from MP payment ${paymentId}`,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to backfill payment snapshot for order ${order.id}: ${error.message}`,
      );
    }
  }
}
