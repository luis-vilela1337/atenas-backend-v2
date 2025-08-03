import {
  CreatePreferenceInputDto,
  CreatePreferenceResponseDto,
} from '@presentation/mercado-pago/dto/create-preference.dto';
import {
  PaymentPreference,
  PaymentPreferenceResult,
} from '@core/mercado-pago/entities/payment-preference.entity';

export class CreatePreferenceAdapter {
  static toEntity(dto: CreatePreferenceInputDto): PaymentPreference {
    return {
      items: dto.items.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
      payer: {
        name: dto.payer.name,
        surname: dto.payer.surname,
        email: dto.payer.email,
        phone: {
          area_code: dto.payer.phone.area_code,
          number: dto.payer.phone.number,
        },
        address: {
          street_name: dto.payer.address.street_name,
          street_number: dto.payer.address.street_number,
          zip_code: dto.payer.address.zip_code,
        },
      },
    };
  }

  static toResponseDto(
    result: PaymentPreferenceResult,
  ): CreatePreferenceResponseDto {
    return {
      id: result.id,
      checkoutUrl: result.checkoutUrl,
    };
  }
}
