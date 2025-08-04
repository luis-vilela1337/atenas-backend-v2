import {
  WebhookNotification,
  PaymentStatus,
  WebhookProcessingResult,
} from '../entities/webhook-notification.entity';
import { WebhookRepositoryInterface } from '../repositories/webhook.repository.interface';

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
  ) {}

  async execute(input: ProcessWebhookInput): Promise<WebhookProcessingResult> {
    try {
      const existingNotification = await this.webhookRepository.findNotificationById(
        input.id,
      );

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
    const merchantOrderDetails = await this.webhookRepository.getMerchantOrderDetails(
      merchantOrderId,
    );

    if (merchantOrderDetails.payments && merchantOrderDetails.payments.length > 0) {
      const payment = merchantOrderDetails.payments[0];
      return await this.processPaymentNotification(payment.id);
    }

    return undefined;
  }
}