import {
  PaymentPreference,
  PaymentPreferenceResult,
} from '../entities/payment-preference.entity';

export interface MercadoPagoRepositoryInterface {
  createPreference(
    preference: PaymentPreference,
  ): Promise<PaymentPreferenceResult>;
}
