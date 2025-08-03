import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { MercadoPagoRepositoryInterface } from '../repositories/mercado-pago.repository.interface';
import {
  PaymentPreference,
  PaymentPreferenceResult,
} from '../entities/payment-preference.entity';

@Injectable()
export class CreatePreferenceUseCase {
  constructor(
    @Inject('MercadoPagoRepositoryInterface')
    private readonly mercadoPagoRepository: MercadoPagoRepositoryInterface,
  ) {}

  async execute(
    preference: PaymentPreference,
  ): Promise<PaymentPreferenceResult> {
    try {
      if (!preference.items || preference.items.length === 0) {
        throw new BadRequestException(
          'É necessário fornecer pelo menos um item',
        );
      }

      preference.items.forEach((item, index) => {
        if (item.quantity <= 0) {
          throw new BadRequestException(
            `Item ${index + 1}: quantidade deve ser maior que zero`,
          );
        }
        if (item.unit_price <= 0) {
          throw new BadRequestException(
            `Item ${index + 1}: preço unitário deve ser maior que zero`,
          );
        }
      });

      if (!preference.payer.email) {
        throw new BadRequestException('Email do pagador é obrigatório');
      }

      const result = await this.mercadoPagoRepository.createPreference(
        preference,
      );

      if (!result.id || !result.checkoutUrl) {
        throw new BadRequestException(
          'Erro ao criar preferência de pagamento no Mercado Pago',
        );
      }

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro interno ao processar pagamento');
    }
  }
}
