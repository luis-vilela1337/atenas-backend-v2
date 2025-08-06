import {
  CreateOrderDto,
  CreateOrderResponseDto,
} from '@presentation/orders/dto/create-order.dto';
import {
  CreateOrderInput,
  CreateOrderResult,
  CartItem,
  SelectionDetails,
  Order,
} from '@core/orders/entities/order.entity';
import { ListOrdersQueryDto } from '@presentation/orders/dto/list-orders-query.dto';
import { OrderListResponseDto } from '@presentation/orders/dto/order-list-response.dto';
import { OrderDto } from '@presentation/orders/dto/order-response.dto';
import {
  FindOrdersInput,
  FindOrdersResult,
} from '@core/orders/dto/find-orders.dto';

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

  static toFindOrdersInput(query: ListOrdersQueryDto): FindOrdersInput {
    return {
      filter: {
        userId: query.userId,
        paymentStatus: query.paymentStatus,
      },
      pagination: {
        page: query.page || 1,
        limit: query.limit || 10,
      },
    };
  }

  static toOrderListResponseDto(
    result: FindOrdersResult,
  ): OrderListResponseDto {
    return {
      data: result.orders.map((order) => this.toOrderDto(order)),
      meta: {
        totalItems: result.totalItems,
        itemCount: result.itemCount,
        itemsPerPage: result.itemsPerPage,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
      },
    };
  }

  static toOrderDto(order: Order): OrderDto {
    return {
      id: order.id,
      userId: order.userId,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      paymentGatewayId: order.paymentGatewayId,
      shippingAddress: {
        zipCode: order.shippingAddress.zipCode,
        street: order.shippingAddress.street,
        number: order.shippingAddress.number,
        complement: order.shippingAddress.complement,
        neighborhood: order.shippingAddress.neighborhood,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
      },
      createdAt: order.createdAt.toISOString(),
      updatedAt:
        order.updatedAt?.toISOString() || order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        orderId: order.id,
        productId: item.productId,
        productName: item.productName,
        productType: item.productType,
        itemPrice: item.itemPrice,
        createdAt: order.createdAt.toISOString(),
        details: item.details.map((detail) => ({
          id: detail.id,
          orderItemId: item.id,
          photoId: detail.photoId,
          eventId: detail.eventId,
          isPackage: detail.isPackage,
        })),
      })),
    };
  }
}
