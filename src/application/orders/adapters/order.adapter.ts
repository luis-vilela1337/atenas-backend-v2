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
  PaymentSnapshot,
} from '@core/orders/entities/order.entity';
import { ListOrdersQueryDto } from '@presentation/orders/dto/list-orders-query.dto';
import { OrderListResponseDto } from '@presentation/orders/dto/order-list-response.dto';
import { OrderDto } from '@presentation/orders/dto/order-response.dto';
import { OrderReportDto } from '@presentation/orders/dto/order-report.dto';
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
      paymentMethod: result.paymentMethod,
      contractNumber: result.contractNumber,
      creditUsed: result.creditUsed,
      remainingCredit: result.remainingCredit,
    };
  }

  private static toCartItem(item: any): CartItem {
    return {
      productId: item.productId,
      productName: item.productName,
      productType: item.productType,
      totalPrice: item.totalPrice,
      quantity: item.quantity,
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
    checkoutUrl?: string,
    studentName?: string,
  ): Promise<OrderDto> {
    // Debug log
    console.log('[OrderAdapter] Processing order:', {
      orderId: order.id,
      itemsCount: order.items.length,
      firstItemDetails: order.items[0]?.details?.[0],
    });

    const items = await Promise.all(
      order.items.map(async (item) => {
        const details = await Promise.all(
          item.details.map(async (detail) => ({
            photoUrl: detail.photoFileName
              ? await imageStorageService.generateSignedUrl(
                  detail.photoFileName,
                  'read',
                )
              : undefined,
            photoName: detail.photoFileName
              ? imageStorageService.extractReadableFilename(
                  detail.photoFileName,
                )
              : undefined,
            eventId: detail.eventId,
            eventName: detail.eventName,
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
          quantity: item.quantity,
          fulfillmentStatus: item.fulfillmentStatus,
          completedAt: item.completedAt
            ? item.completedAt.toISOString()
            : undefined,
          createdAt: order.createdAt.toISOString(),
          details,
        };
      }),
    );

    const report = this.buildReport(order, studentName);

    return {
      id: order.id,
      displayId: order.displayId,
      userId: order.userId,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      paymentGatewayId: order.paymentGatewayId,
      contractNumber: order.contractNumber,
      checkoutUrl,
      creditUsed: order.creditUsed,
      shippingAddress: order.shippingAddress
        ? {
            zipCode: order.shippingAddress.zipCode,
            street: order.shippingAddress.street,
            number: order.shippingAddress.number,
            complement: order.shippingAddress.complement,
            neighborhood: order.shippingAddress.neighborhood,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
          }
        : undefined,
      createdAt: order.createdAt.toISOString(),
      updatedAt:
        order.updatedAt?.toISOString() || order.createdAt.toISOString(),
      items,
      report,
    };
  }

  private static buildReport(
    order: Order,
    studentName?: string,
  ): OrderReportDto {
    const payer = order.payerSnapshot;
    const payment = order.paymentSnapshot;
    const creditUsed = order.creditUsed ? Number(order.creditUsed) : 0;

    const provider = this.resolvePaymentProvider(order, payment);
    const description = this.buildPaymentDescription(
      provider,
      payment,
      creditUsed,
      order.totalAmount,
    );

    const totalPaid = payment?.totalPaidAmount ?? null;
    const netReceived = payment?.netReceivedAmount ?? null;
    const mercadoPagoFee =
      totalPaid != null && netReceived != null
        ? Math.round((totalPaid - netReceived) * 100) / 100
        : null;

    return {
      saleDate: order.createdAt.toISOString(),
      contractNumber: order.contractNumber || '',
      student: {
        name: studentName || '',
      },
      buyer: {
        name: payer?.name || '',
        cpf: payment?.payerCpf || null,
        email: payment?.payerEmail || payer?.email || null,
        phone: payer?.phone || null,
      },
      amounts: {
        orderAmount: Number(order.totalAmount),
        atenasCreditUsed: creditUsed,
        mercadoPagoFee,
        netReceivedAmount: netReceived,
        totalPaidAmount: totalPaid,
      },
      payment: {
        provider,
        status: payment?.status || order.paymentStatus,
        methodId: payment?.methodId || null,
        methodType: payment?.methodType || null,
        installments: payment?.installments || null,
        installmentAmount: payment?.installmentAmount || null,
        description,
      },
      delivery: order.shippingAddress
        ? {
            zipCode: order.shippingAddress.zipCode,
            street: order.shippingAddress.street,
            number: order.shippingAddress.number,
            complement: order.shippingAddress.complement || null,
            neighborhood: order.shippingAddress.neighborhood,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            phone: payer?.phone || null,
            email: payment?.payerEmail || payer?.email || null,
          }
        : null,
    };
  }

  private static resolvePaymentProvider(
    order: Order,
    payment?: PaymentSnapshot,
  ): 'MERCADO_PAGO' | 'CREDIT' | 'FREE' | 'UNKNOWN' {
    if (Number(order.totalAmount) === 0) return 'FREE';
    const creditUsed = order.creditUsed ? Number(order.creditUsed) : 0;
    if (creditUsed >= Number(order.totalAmount) && !order.paymentGatewayId)
      return 'CREDIT';
    if (payment?.methodId || order.paymentGatewayId) return 'MERCADO_PAGO';
    return 'UNKNOWN';
  }

  private static buildPaymentDescription(
    provider: string,
    payment?: PaymentSnapshot,
    creditUsed?: number,
    totalAmount?: number,
  ): string {
    if (provider === 'FREE') return 'Gratuito';
    if (
      provider === 'CREDIT' &&
      creditUsed &&
      totalAmount &&
      creditUsed >= totalAmount
    )
      return 'Crédito Atenas';

    if (!payment?.methodType) {
      if (payment?.status === 'pending' || !payment) return 'Pendente';
      return 'Mercado Pago';
    }

    if (payment.methodType === 'credit_card') {
      const installments = payment.installments || 1;
      return `${installments}x cartão de crédito`;
    }
    if (payment.methodType === 'debit_card') return 'Cartão de débito';
    if (
      payment.methodId === 'pix' ||
      payment.methodType === 'bank_transfer'
    )
      return 'Pix';
    if (payment.methodType === 'ticket') return 'Boleto';

    return 'Mercado Pago';
  }
}
