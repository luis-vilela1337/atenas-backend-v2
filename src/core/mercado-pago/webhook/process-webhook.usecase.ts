import { Logger } from '@nestjs/common';
import {
  WebhookNotification,
  PaymentStatus,
  WebhookProcessingResult,
} from '../entities/webhook-notification.entity';
import { WebhookRepositoryInterface } from '../repositories/webhook.repository.interface';
import { OrderRepositoryInterface } from '../../orders/repositories/order.repository.interface';
import { OrderStatus } from '../../orders/entities/order.entity';
import { UserSQLRepository } from '../../../infra/data/sql/repositories/user.repository';
import { CartRepositoryInterface } from '../../cart/repositories/cart.repository.interface';

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
  private readonly logger = new Logger(ProcessWebhookUseCase.name);

  constructor(
    private readonly webhookRepository: WebhookRepositoryInterface,
    private readonly orderRepository: OrderRepositoryInterface,
    private readonly userRepository: UserSQLRepository,
    private readonly cartRepository?: CartRepositoryInterface,
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
      const orderId = paymentStatus.externalReference;

      if (!orderId) {
        this.logger.warn('No external reference found in payment status');
        return;
      }

      if (!this.orderRepository) {
        this.logger.warn('Order repository not available');
        return;
      }

      let order = await this.orderRepository.findOrderByPaymentGatewayId(
        paymentStatus.paymentId,
      );

      if (!order) {
        order = await this.orderRepository.findOrderById(orderId);
      }

      if (!order) {
        this.logger.warn(`Order not found for external reference: ${orderId}`);
        return;
      }

      const orderStatus = this.mapPaymentStatusToOrderStatus(
        paymentStatus.status,
      );

      if (orderStatus) {
        if (orderStatus === OrderStatus.APPROVED) {
          if (
            order.creditUsed &&
            order.creditUsed > 0 &&
            !order.creditRestored
          ) {
            await this.orderRepository.markCreditRestored(order.id);
            await this.userRepository.consumeReservedCredit(
              order.userId,
              order.creditUsed,
            );
            this.logger.log(
              `Consumed ${order.creditUsed} reserved credit for user ${order.userId}`,
            );
          }
        } else if (
          orderStatus === OrderStatus.CANCELLED ||
          orderStatus === OrderStatus.REJECTED
        ) {
          if (
            order.creditUsed &&
            order.creditUsed > 0 &&
            !order.creditRestored
          ) {
            await this.orderRepository.markCreditRestored(order.id);
            await this.userRepository.releaseReservedCredit(
              order.userId,
              order.creditUsed,
            );
            this.logger.log(
              `Released ${order.creditUsed} reserved credit back to user ${order.userId}`,
            );
          }
        }

        await this.orderRepository.updateOrderStatus(order.id, orderStatus);
        this.logger.log(`Order ${order.id} status updated to: ${orderStatus}`);

        if (orderStatus === OrderStatus.APPROVED) {
          await this.clearCartSafe(order.userId);
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error updating order status: ${message}`);
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

  private async clearCartSafe(userId: string): Promise<void> {
    try {
      if (this.cartRepository) {
        await this.cartRepository.clearByUserId(userId);
        this.logger.log(
          `Cart cleared for user ${userId} after payment approval`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to clear cart for user ${userId}: ${message}`);
    }
  }
}
