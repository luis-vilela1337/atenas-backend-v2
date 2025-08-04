import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebhookRepositoryInterface } from '@core/mercado-pago/repositories/webhook.repository.interface';
import {
  WebhookNotification,
  PaymentStatus,
} from '@core/mercado-pago/entities/webhook-notification.entity';
import { MercadoPagoConfig, Payment, MerchantOrder } from 'mercadopago';

@Injectable()
export class MercadoPagoWebhookService implements WebhookRepositoryInterface {
  private readonly logger = new Logger(MercadoPagoWebhookService.name);
  private client: MercadoPagoConfig;
  private payment: Payment;
  private merchantOrder: MerchantOrder;
  private notifications: Map<string, WebhookNotification> = new Map();

  constructor(private readonly configService: ConfigService) {
    const accessToken = this.configService.get<string>(
      'MERCADO_PAGO_ACCESS_TOKEN',
    );

    if (!accessToken) {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
    }

    this.client = new MercadoPagoConfig({
      accessToken,
      options: {
        timeout: 5000,
      },
    });

    this.payment = new Payment(this.client);
    this.merchantOrder = new MerchantOrder(this.client);
  }

  async saveNotification(notification: WebhookNotification): Promise<WebhookNotification> {
    this.logger.log(`Saving notification: ${notification.id}`);
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async findNotificationById(id: string): Promise<WebhookNotification | null> {
    this.logger.log(`Finding notification by ID: ${id}`);
    return this.notifications.get(id) || null;
  }

  async updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<void> {
    this.logger.log(`Updating payment status for: ${paymentId} to ${status.status}`);
  }

  async getPaymentDetails(paymentId: string): Promise<any> {
    try {
      this.logger.log(`Getting payment details for: ${paymentId}`);
      
      const response = await this.payment.get({
        id: paymentId,
      });

      if (!response) {
        throw new Error(`Payment not found: ${paymentId}`);
      }

      return {
        id: response.id,
        status: response.status,
        status_detail: response.status_detail,
        external_reference: response.external_reference,
        transaction_amount: response.transaction_amount,
        date_approved: response.date_approved,
        date_created: response.date_created,
        date_last_updated: response.date_last_updated,
        payer: response.payer,
        payment_method_id: response.payment_method_id,
        payment_type_id: response.payment_type_id,
      };
    } catch (error) {
      this.logger.error(`Error getting payment details: ${error.message}`);
      throw new Error(`Failed to get payment details: ${error.message}`);
    }
  }

  async getMerchantOrderDetails(merchantOrderId: string): Promise<any> {
    try {
      this.logger.log(`Getting merchant order details for: ${merchantOrderId}`);
      
      const response = await this.merchantOrder.get({
        merchantOrderId,
      });

      if (!response) {
        throw new Error(`Merchant order not found: ${merchantOrderId}`);
      }

      return {
        id: response.id,
        status: response.status,
        external_reference: response.external_reference,
        payments: response.payments,
        items: response.items,
        payer: response.payer,
        total_amount: response.total_amount,
        date_created: response.date_created,
        last_updated: response.last_updated,
      };
    } catch (error) {
      this.logger.error(`Error getting merchant order details: ${error.message}`);
      throw new Error(`Failed to get merchant order details: ${error.message}`);
    }
  }
}