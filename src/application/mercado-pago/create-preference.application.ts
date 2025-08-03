import { Injectable } from '@nestjs/common';
import { CreatePreferenceUseCase } from '@core/mercado-pago/create-preference/usecase';
import {
  PaymentPreference,
  PaymentPreferenceResult,
} from '@core/mercado-pago/entities/payment-preference.entity';

@Injectable()
export class CreatePreferenceApplication {
  constructor(
    private readonly createPreferenceUseCase: CreatePreferenceUseCase,
  ) {}

  async execute(
    preference: PaymentPreference,
  ): Promise<PaymentPreferenceResult> {
    return await this.createPreferenceUseCase.execute(preference);
  }
}
