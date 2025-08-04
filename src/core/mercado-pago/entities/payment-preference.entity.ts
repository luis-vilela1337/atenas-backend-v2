export interface PaymentItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export interface PayerPhone {
  area_code: string;
  number: string;
}

export interface PayerAddress {
  street_name: string;
  street_number: string;
  zip_code: string;
}

export interface Payer {
  name: string;
  surname: string;
  email: string;
  phone: PayerPhone;
  address: PayerAddress;
}

export interface PaymentPreference {
  items: PaymentItem[];
  payer: Payer;
  externalReference?: string;
}

export interface PaymentPreferenceResult {
  id: string;
  checkoutUrl: string;
}
