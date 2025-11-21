import {
  WebhookNotification,
  PaymentStatus,
  WebhookProcessingResult,
} from '../entities/webhook-notification.entity';
import { WebhookRepositoryInterface } from '../repositories/webhook.repository.interface';
import { OrderRepositoryInterface } from '../../orders/repositories/order.repository.interface';
import { OrderStatus } from '../../orders/entities/order.entity';
import { UserSQLRepository } from '../../../infra/data/sql/repositories/user.repository';

export interface ProcessWebhookInput {
  id: string;
  type: 'payment' | 'merchant_order';
  dataId: string;
  liveMode: boolean;
  dateCreated: string;
  userId: string;
  apiVersion: string;
  action: string;
  rawData: any;
}

export class ProcessWebhookUseCase {
  constructor(
    private readonly webhookRepository: WebhookRepositoryInterface,
    private readonly orderRepository?: OrderRepositoryInterface,
    private readonly userRepository?: UserSQLRepository,
  ) {}

  async execute(input: ProcessWebhookInput): Promise<WebhookProcessingResult> {
    try {
      const existingNotification =
        await this.webhookRepository.findNotificationById(input.id);

      if (existingNotification?.status === 'processed') {
        return {
          notificationId: input.id,
          processed: false,
          error: 'Webhook already processed',
        };
      }

      const notification: WebhookNotification = {
        id: input.id,
        type: input.type,
        paymentId: input.type === 'payment' ? input.dataId : undefined,
        merchantOrderId:
          input.type === 'merchant_order' ? input.dataId : undefined,
        status: 'pending',
        createdAt: new Date(input.dateCreated),
        rawData: input.rawData,
      };

      await this.webhookRepository.saveNotification(notification);

      let paymentStatus: PaymentStatus | undefined;

      if (input.type === 'payment') {
        paymentStatus = await this.processPaymentNotification(input.dataId);
      } else if (input.type === 'merchant_order') {
        paymentStatus = await this.processMerchantOrderNotification(
          input.dataId,
        );
      }

      await this.webhookRepository.saveNotification({
        ...notification,
        status: 'processed',
        processedAt: new Date(),
      });

      // Update order status if order repository is available and payment was processed
      if (
        this.orderRepository &&
        paymentStatus &&
        paymentStatus.externalReference
      ) {
        await this.updateOrderStatus(paymentStatus);
      }

      return {
        notificationId: input.id,
        processed: true,
        paymentStatus,
      };
    } catch (error) {
      await this.webhookRepository.saveNotification({
        id: input.id,
        type: input.type,
        paymentId: input.type === 'payment' ? input.dataId : undefined,
        merchantOrderId:
          input.type === 'merchant_order' ? input.dataId : undefined,
        status: 'failed',
        createdAt: new Date(input.dateCreated),
        rawData: input.rawData,
      });

      return {
        notificationId: input.id,
        processed: false,
        error: error.message,
      };
    }
  }

  private async processPaymentNotification(
    paymentId: string,
  ): Promise<PaymentStatus> {
    const paymentDetails = await this.webhookRepository.getPaymentDetails(
      paymentId,
    );

    const paymentStatus: PaymentStatus = {
      id: paymentDetails.id,
      status: paymentDetails.status,
      statusDetail: paymentDetails.status_detail,
      paymentId: paymentDetails.id,
      externalReference: paymentDetails.external_reference,
      transactionAmount: paymentDetails.transaction_amount,
      dateApproved: paymentDetails.date_approved
        ? new Date(paymentDetails.date_approved)
        : undefined,
      dateCreated: new Date(paymentDetails.date_created),
      lastModified: new Date(paymentDetails.date_last_updated),
    };

    await this.webhookRepository.updatePaymentStatus(paymentId, paymentStatus);

    return paymentStatus;
  }

  private async processMerchantOrderNotification(
    merchantOrderId: string,
  ): Promise<PaymentStatus | undefined> {
    const merchantOrderDetails =
      await this.webhookRepository.getMerchantOrderDetails(merchantOrderId);

    if (
      merchantOrderDetails.payments &&
      merchantOrderDetails.payments.length > 0
    ) {
      const payment = merchantOrderDetails.payments[0];
      return await this.processPaymentNotification(payment.id);
    }

    return undefined;
  }

  private async updateOrderStatus(paymentStatus: PaymentStatus): Promise<void> {
    try {
      // Extract order ID from external reference (assuming format: orderId)
      const orderId = paymentStatus.externalReference;

      if (!orderId) {
        console.warn('No external reference found in payment status');
        return;
      }

      // Find order by payment gateway ID (preference ID) first
      if (!this.orderRepository) {
        console.warn('Order repository not available');
        return;
      }

      let order = await this.orderRepository.findOrderByPaymentGatewayId(
        paymentStatus.paymentId,
      );

      // If not found by payment gateway ID, try by order ID directly
      if (!order) {
        order = await this.orderRepository.findOrderById(orderId);
      }

      if (!order) {
        console.warn(`Order not found for external reference: ${orderId}`);
        return;
      }

      // Map Mercado Pago status to our order status
      const orderStatus = this.mapPaymentStatusToOrderStatus(
        paymentStatus.status,
      );

      if (orderStatus) {
        // Restore credit if order is cancelled or rejected and credit was used
        if (
          (orderStatus === OrderStatus.CANCELLED ||
            orderStatus === OrderStatus.REJECTED) &&
          order.creditUsed &&
          order.creditUsed > 0 &&
          this.userRepository
        ) {
          const currentCredit =
            await this.userRepository.findUserCreditByUserId(order.userId);
          await this.userRepository.updateUserCredit(
            order.userId,
            currentCredit + order.creditUsed,
          );
          console.log(
            `Restored ${order.creditUsed} credit to user ${order.userId}`,
          );
        }

        await this.orderRepository.updateOrderStatus(order.id, orderStatus);
        console.log(`Order ${order.id} status updated to: ${orderStatus}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error.message);
      // Don't throw error to avoid breaking webhook processing
    }
  }

  private mapPaymentStatusToOrderStatus(
    paymentStatus: string,
  ): OrderStatus | null {
    const statusMap: Record<string, OrderStatus> = {
      approved: OrderStatus.APPROVED,
      authorized: OrderStatus.APPROVED,
      pending: OrderStatus.PENDING,
      in_process: OrderStatus.PENDING,
      in_mediation: OrderStatus.PENDING,
      rejected: OrderStatus.REJECTED,
      cancelled: OrderStatus.CANCELLED,
      refunded: OrderStatus.CANCELLED,
      charged_back: OrderStatus.CANCELLED,
    };

    return statusMap[paymentStatus] || null;
  }
}
