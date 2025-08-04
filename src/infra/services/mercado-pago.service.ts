import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoRepositoryInterface } from '@core/mercado-pago/repositories/mercado-pago.repository.interface';
import {
  PaymentPreference,
  PaymentPreferenceResult,
} from '@core/mercado-pago/entities/payment-preference.entity';
import { MercadoPagoConfig, Preference } from 'mercadopago';

@Injectable()
export class MercadoPagoService implements MercadoPagoRepositoryInterface {
  private client: MercadoPagoConfig;
  private preference: Preference;

  constructor(private readonly configService: ConfigService) {
    const accessToken = this.configService.get<string>(
      'MERCADO_PAGO_ACCESS_TOKEN',
    );
    const userId = this.configService.get<string>('MERCADO_PAGO_USER_ID');

    if (!accessToken) {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
    }

    if (!userId) {
      throw new Error('MERCADO_PAGO_USER_ID não configurado');
    }

    this.client = new MercadoPagoConfig({
      accessToken,
      options: {
        timeout: 5000,
        integratorId: userId,
      },
    });

    this.preference = new Preference(this.client);
  }

  async createPreference(
    paymentPreference: PaymentPreference,
  ): Promise<PaymentPreferenceResult> {
    try {
      const preferenceRequest = {
        items: paymentPreference.items.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: 'BRL',
        })),
        payer: {
          name: paymentPreference.payer.name,
          surname: paymentPreference.payer.surname,
          email: paymentPreference.payer.email,
          phone: {
            area_code: paymentPreference.payer.phone.area_code,
            number: paymentPreference.payer.phone.number,
          },
          address: {
            street_name: paymentPreference.payer.address.street_name,
            street_number: paymentPreference.payer.address.street_number,
            zip_code: paymentPreference.payer.address.zip_code,
          },
        },
        back_urls: {
          success: this.configService.get<string>(
            'MERCADO_PAGO_SUCCESS_URL',
            'https://success.com',
          ),
          failure: this.configService.get<string>(
            'MERCADO_PAGO_FAILURE_URL',
            'https://failure.com',
          ),
          pending: this.configService.get<string>(
            'MERCADO_PAGO_PENDING_URL',
            'https://pending.com',
          ),
        },
        auto_return: 'approved' as const,
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 12,
        },
        notification_url: this.configService.get<string>(
          'MERCADO_PAGO_NOTIFICATION_URL',
        ),
        statement_descriptor: 'ATENAS',
        external_reference:
          paymentPreference.externalReference || `atenas-${Date.now()}`,
      };

      const response = await this.preference.create({
        body: preferenceRequest,
      });

      if (!response.id || !response.init_point) {
        throw new BadRequestException('Resposta inválida do Mercado Pago');
      }

      return {
        id: response.id,
        checkoutUrl: response.init_point,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        `Erro ao criar preferência no Mercado Pago: ${error.message}`,
      );
    }
  }
}
