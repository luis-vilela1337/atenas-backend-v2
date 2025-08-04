import { MercadoPagoWebhookDto, WebhookResponseDto } from '@presentation/mercado-pago/dto/webhook.dto';
import { WebhookNotification, WebhookProcessingResult } from '@core/mercado-pago/entities/webhook-notification.entity';

export class WebhookAdapter {
  static toEntity(dto: MercadoPagoWebhookDto): WebhookNotification {
    return {
      id: dto.id,
      type: dto.type,
      paymentId: dto.type === 'payment' ? dto.data.id : undefined,
      merchantOrderId: dto.type === 'merchant_order' ? dto.data.id : undefined,
      status: 'pending',
      createdAt: new Date(dto.date_created),
      rawData: dto,
    };
  }

  static toResponseDto(result: WebhookProcessingResult): WebhookResponseDto {
    if (result.processed) {
      return {
        status: 'success',
        message: 'Webhook processed successfully',
      };
    } else {
      return {
        status: 'error',
        message: 'Failed to process webhook',
        error: result.error,
      };
    }
  }
}