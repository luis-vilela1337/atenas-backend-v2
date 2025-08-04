import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ProcessWebhookUseCase,
  ProcessWebhookInput,
} from '@core/mercado-pago/webhook/process-webhook.usecase';
import {
  ValidateSignatureUseCase,
  ValidateSignatureInput,
} from '@core/mercado-pago/webhook/validate-signature.usecase';
import { WebhookRepositoryInterface } from '@core/mercado-pago/repositories/webhook.repository.interface';
import { OrderRepositoryInterface } from '@core/orders/repositories/order.repository.interface';
import { MercadoPagoWebhookDto } from '@presentation/mercado-pago/dto/webhook.dto';
import { WebhookProcessingResult } from '@core/mercado-pago/entities/webhook-notification.entity';

export interface ProcessWebhookApplicationInput {
  webhookData: MercadoPagoWebhookDto;
  signature: string;
  requestBody: string;
}

@Injectable()
export class ProcessWebhookApplication {
  private readonly logger = new Logger(ProcessWebhookApplication.name);
  private readonly processWebhookUseCase: ProcessWebhookUseCase;
  private readonly validateSignatureUseCase: ValidateSignatureUseCase;

  constructor(
    @Inject('WebhookRepositoryInterface')
    private readonly webhookRepository: WebhookRepositoryInterface,
    @Inject('OrderRepositoryInterface')
    private readonly orderRepository: OrderRepositoryInterface,
    private readonly configService: ConfigService,
  ) {
    this.processWebhookUseCase = new ProcessWebhookUseCase(
      webhookRepository,
      orderRepository,
    );
    this.validateSignatureUseCase = new ValidateSignatureUseCase();
  }

  async execute(
    input: ProcessWebhookApplicationInput,
  ): Promise<WebhookProcessingResult> {
    this.logger.log(`Processing webhook: ${input.webhookData.id}`);

    try {
      const isSignatureValidationEnabled = this.configService.get<boolean>(
        'MERCADO_PAGO_WEBHOOK_SIGNATURE_VALIDATION',
        true,
      );

      if (isSignatureValidationEnabled) {
        const webhookSecret = this.configService.get<string>(
          'MERCADO_PAGO_WEBHOOK_SECRET',
        );

        if (!webhookSecret) {
          this.logger.warn(
            'Webhook secret not configured, skipping signature validation',
          );
        } else {
          const validationInput: ValidateSignatureInput = {
            signature: input.signature,
            requestBody: input.requestBody,
            webhookSecret,
          };

          const validationResult =
            this.validateSignatureUseCase.execute(validationInput);

          if (!validationResult.isValid) {
            this.logger.error(
              `Signature validation failed: ${validationResult.error}`,
            );
            return {
              notificationId: input.webhookData.id,
              processed: false,
              error: `Signature validation failed: ${validationResult.error}`,
            };
          }

          this.logger.log('Signature validation successful');
        }
      } else {
        this.logger.warn('Signature validation is disabled');
      }

      const processInput: ProcessWebhookInput = {
        id: input.webhookData.id,
        type: input.webhookData.type,
        dataId: input.webhookData.data.id,
        liveMode: input.webhookData.live_mode,
        dateCreated: input.webhookData.date_created,
        userId: input.webhookData.user_id,
        apiVersion: input.webhookData.api_version,
        action: input.webhookData.action,
        rawData: input.webhookData,
      };

      const result = await this.processWebhookUseCase.execute(processInput);

      this.logger.log(
        `Webhook processing completed: ${result.notificationId}, processed: ${result.processed}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error processing webhook: ${error.message}`,
        error.stack,
      );
      return {
        notificationId: input.webhookData.id,
        processed: false,
        error: error.message,
      };
    }
  }
}
