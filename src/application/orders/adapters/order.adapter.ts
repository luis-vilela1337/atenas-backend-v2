import {
  CreateOrderDto,
  CreateOrderResponseDto,
} from '@presentation/orders/dto/create-order.dto';
import {
  CreateOrderInput,
  CreateOrderResult,
  CartItem,
  SelectionDetails,
} from '@core/orders/entities/order.entity';

export class OrderAdapter {
  static toCreateOrderInput(
    dto: CreateOrderDto,
    userId: string,
  ): CreateOrderInput {
    return {
      userId,
      cartItems: dto.cartItems.map((item) => this.toCartItem(item)),
      shippingDetails: {
        zipCode: dto.shippingDetails.zipCode,
        street: dto.shippingDetails.street,
        number: dto.shippingDetails.number,
        complement: dto.shippingDetails.complement,
        neighborhood: dto.shippingDetails.neighborhood,
        city: dto.shippingDetails.city,
        state: dto.shippingDetails.state,
      },
      payer: {
        firstName: dto.payer.firstName,
        lastName: dto.payer.lastName,
        email: dto.payer.email,
        phone: {
          areaCode: dto.payer.phone.areaCode,
          number: dto.payer.phone.number,
        },
      },
    };
  }

  static toCreateOrderResponseDto(
    result: CreateOrderResult,
  ): CreateOrderResponseDto {
    return {
      orderId: result.orderId,
      mercadoPagoCheckoutUrl: result.mercadoPagoCheckoutUrl,
    };
  }

  private static toCartItem(item: any): CartItem {
    return {
      productId: item.productId,
      productName: item.productName,
      productType: item.productType,
      totalPrice: item.totalPrice,
      selectionDetails: this.toSelectionDetails(item.selectionDetails),
    };
  }

  private static toSelectionDetails(details: any): SelectionDetails {
    return {
      photos: details.photos?.map((photo: any) => ({
        id: photo.id,
        eventId: photo.eventId,
      })),
      events: details.events?.map((event: any) => ({
        id: event.id,
        isPackage: event.isPackage,
      })),
      isFullPackage: details.isFullPackage,
      albumPhotos: details.albumPhotos,
    };
  }
}
