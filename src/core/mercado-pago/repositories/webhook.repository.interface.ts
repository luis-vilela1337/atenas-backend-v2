import {
  WebhookNotification,
  PaymentStatus,
} from '../entities/webhook-notification.entity';

export interface WebhookRepositoryInterface {
  saveNotification(
    notification: WebhookNotification,
  ): Promise<WebhookNotification>;
  findNotificationById(id: string): Promise<WebhookNotification | null>;
  updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<void>;
  getPaymentDetails(paymentId: string): Promise<any>;
  getMerchantOrderDetails(merchantOrderId: string): Promise<any>;
}
