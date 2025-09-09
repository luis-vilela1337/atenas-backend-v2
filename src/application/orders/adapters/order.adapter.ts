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
import { ImageStorageService } from '@infrastructure/services/image-storage.service';

export class OrderAdapter {
  static toCreateOrderInput(
    dto: CreateOrderDto,
    userId: string,
  ): CreateOrderInput {
    return {
      userId,
      cartItems: dto.cartItems.map((item) => this.toCartItem(item)),
      shippingDetails: dto.shippingDetails
        ? {
            zipCode: dto.shippingDetails.zipCode,
            street: dto.shippingDetails.street,
            number: dto.shippingDetails.number,
            complement: dto.shippingDetails.complement,
            neighborhood: dto.shippingDetails.neighborhood,
            city: dto.shippingDetails.city,
            state: dto.shippingDetails.state,
          }
        : undefined,
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
      mercadoPagoCheckoutUrl: result.checkoutUrl,
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

  static async toOrderListResponseDto(
    result: FindOrdersResult,
    imageStorageService: ImageStorageService,
  ): Promise<OrderListResponseDto> {
    const data = await Promise.all(
      result.orders.map((order) => this.toOrderDto(order, imageStorageService)),
    );

    return {
      data,
      meta: {
        totalItems: result.totalItems,
        itemCount: result.itemCount,
        itemsPerPage: result.itemsPerPage,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
      },
    };
  }

  static async toOrderDto(
    order: Order,
    imageStorageService: ImageStorageService,
  ): Promise<OrderDto> {
    const items = await Promise.all(
      order.items.map(async (item) => {
        const details = await Promise.all(
          item.details.map(async (detail) => ({
            id: detail.id,
            orderItemId: item.id,
            photoUrl: detail.photoFileName
              ? await imageStorageService.generateSignedUrl(
                  detail.photoFileName,
                  'read',
                )
              : undefined,
            eventId: detail.eventId,
            isPackage: detail.isPackage,
          })),
        );

        return {
          id: item.id,
          orderId: order.id,
          productId: item.productId,
          productName: item.productName,
          productType: item.productType,
          itemPrice: item.itemPrice,
          createdAt: order.createdAt.toISOString(),
          details,
        };
      }),
    );

    return {
      id: order.id,
      displayId: order.displayId,
      userId: order.userId,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      paymentGatewayId: order.paymentGatewayId,
      contractNumber: order.contractNumber,
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
      items,
    };
  }
}
