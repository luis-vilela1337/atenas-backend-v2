import {
  CreateOrderInput,
  CreateOrderResult,
  Order,
  OrderItemDetail,
  CartItem,
  ShippingAddress,
  OrderStatus,
} from '../entities/order.entity';
import { BadRequestException, HttpException } from '@nestjs/common';
import { OrderRepositoryInterface } from '../repositories/order.repository.interface';
import { MercadoPagoRepositoryInterface } from '../../mercado-pago/repositories/mercado-pago.repository.interface';
import { PaymentPreference } from '../../mercado-pago/entities/payment-preference.entity';
import { UserSQLRepository } from '../../../infra/data/sql/repositories/user.repository';
import { InstitutionProductSQLRepository } from '../../../infra/data/sql/repositories/institution-product.repostitoy';
import {
  AlbumDetails,
  GenericDetails,
  DigitalFilesDetails,
} from '../../../infra/data/sql/entities/institution-products.entity';
import { ConfigService } from '@nestjs/config';
import Decimal from 'decimal.js';

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepositoryInterface,
    private readonly mercadoPagoRepository: MercadoPagoRepositoryInterface,
    private readonly userRepository: UserSQLRepository,
    private readonly institutionProductRepository: InstitutionProductSQLRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(input: CreateOrderInput): Promise<CreateOrderResult> {
    try {
      this.validateSelectionDetails(input.cartItems);
      await this.validateCartItemPrices(input.userId, input.cartItems);
      this.validateShippingRequirement(input.cartItems, input.shippingDetails);

      if (input.shippingDetails) {
        await this.updateUserAddressIfDifferent(
          input.userId,
          input.shippingDetails,
        );
      }

      const totalAmount = input.cartItems.reduce(
        (sum, item) => sum + item.totalPrice * item.quantity,
        0,
      );

      if (totalAmount === 0) {
        const order = await this.createOrder(
          input,
          totalAmount,
          OrderStatus.APPROVED,
        );
        return {
          orderId: order.id,
          checkoutUrl: this.configService.get('BATATA_CHECKOUT_URL'),
          paymentMethod: 'FREE',
          contractNumber: order.contractNumber,
        };
      }

      const userCredit = await this.userRepository.findUserCreditByUserId(
        input.userId,
      );

      if (userCredit >= totalAmount) {
        const deductResult = await this.userRepository.deductCreditAtomic(
          input.userId,
          totalAmount,
        );

        if (!deductResult.success) {
          throw new Error('Crédito insuficiente. Tente novamente.');
        }

        const order = await this.createOrder(
          input,
          totalAmount,
          OrderStatus.APPROVED,
          totalAmount,
        );

        await this.orderRepository.markCreditRestored(order.id);

        return {
          orderId: order.id,
          checkoutUrl: this.configService.get('BATATA_CHECKOUT_URL'),
          paymentMethod: 'CREDIT',
          contractNumber: order.contractNumber,
          creditUsed: totalAmount,
          remainingCredit: deductResult.newCredit,
        };
      }

      const creditToUse = userCredit > 0 ? userCredit : 0;
      const amountToPay = totalAmount - creditToUse;

      if (creditToUse > 0) {
        const reserveResult = await this.userRepository.reserveCredit(
          input.userId,
          creditToUse,
        );

        if (!reserveResult.success) {
          throw new Error('Crédito insuficiente. Tente novamente.');
        }
      }

      const order = await this.createOrder(
        input,
        totalAmount,
        OrderStatus.PENDING,
        creditToUse,
      );

      const preference = this.createMercadoPagoPreference(
        order,
        input,
        amountToPay,
      );
      const mercadoPagoResult =
        await this.mercadoPagoRepository.createPreference(preference);

      await this.orderRepository.updateOrderPaymentGatewayId(
        order.id,
        mercadoPagoResult.id,
      );

      return {
        orderId: order.id,
        checkoutUrl: mercadoPagoResult.checkoutUrl,
        paymentMethod: 'MERCADO_PAGO',
        contractNumber: order.contractNumber,
        creditUsed: creditToUse,
        remainingCredit: 0,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create order: ${error.message}`);
    }
  }

  private async createOrder(
    input: CreateOrderInput,
    totalAmount: number,
    paymentStatus: OrderStatus,
    creditUsed?: number,
  ): Promise<Order> {
    const contractNumber = await this.generateContractNumber(input.userId);
    const contractUniqueId = `${contractNumber}-${Date.now()}`;

    const orderData: Partial<Order> = {
      userId: input.userId,
      totalAmount,
      paymentStatus,
      contractNumber,
      contractUniqueId,
      shippingAddress: input.shippingDetails,
      creditUsed,
      items: input.cartItems.map((item) => ({
        id: '',
        productId: item.productId,
        productName: item.productName,
        productType: item.productType,
        itemPrice: item.totalPrice,
        quantity: item.quantity,
        details: this.createOrderItemDetails(item.selectionDetails),
      })),
    };

    return await this.orderRepository.createOrder(orderData as Order);
  }

  private createOrderItemDetails(selectionDetails: any): OrderItemDetail[] {
    const details: OrderItemDetail[] = [];

    if (selectionDetails.isFullPackage) {
      details.push({
        id: '',
        photoId: undefined,
        eventId: undefined,
        isPackage: true,
      });
      return details;
    }

    if (selectionDetails.photos) {
      for (const photo of selectionDetails.photos) {
        details.push({
          id: '',
          photoId: photo.id,
          eventId: photo.eventId,
          isPackage: undefined,
        });
      }
    }

    if (selectionDetails.events) {
      for (const event of selectionDetails.events) {
        details.push({
          id: '',
          photoId: undefined,
          eventId: event.id,
          isPackage: event.isPackage,
        });
      }
    }

    if (selectionDetails.albumPhotos) {
      for (const photoId of selectionDetails.albumPhotos) {
        details.push({
          id: '',
          photoId: photoId,
          eventId: undefined,
          isPackage: undefined,
        });
      }
    }

    return details;
  }

  private createMercadoPagoPreference(
    order: Order,
    input: CreateOrderInput,
    amountToPay?: number,
  ): PaymentPreference {
    const totalAmount = order.totalAmount;
    const paymentAmount = amountToPay ?? totalAmount;

    return {
      items: order.items.map((item) => {
        const unitPrice =
          amountToPay !== undefined
            ? new Decimal(item.itemPrice)
                .times(paymentAmount)
                .div(totalAmount)
                .toNumber()
            : item.itemPrice;

        return {
          id: item.productId,
          title: item.productName,
          description: `${item.productName} - ${item.productType}`,
          quantity: item.quantity,
          unit_price: unitPrice,
        };
      }),
      payer: {
        name: input.payer.firstName,
        surname: input.payer.lastName,
        email: input.payer.email,
        phone: {
          area_code: input.payer.phone.areaCode,
          number: input.payer.phone.number,
        },
        address: input.shippingDetails
          ? {
              street_name: input.shippingDetails.street,
              street_number: input.shippingDetails.number,
              zip_code: input.shippingDetails.zipCode,
            }
          : {
              street_name: 'N/A',
              street_number: 'N/A',
              zip_code: '00000-000',
            },
      },
      externalReference: order.id,
    };
  }

  private async generateContractNumber(userId: string): Promise<string> {
    const user = await this.userRepository.findById(userId);

    if (!user || !user.institution) {
      throw new Error('User or institution not found');
    }

    return `${user.institution.contractNumber}-${user.identifier}`;
  }

  private validateSelectionDetails(cartItems: CartItem[]): void {
    for (const item of cartItems) {
      const details = item.selectionDetails;

      if (details.isFullPackage) {
        if (
          (details.photos && details.photos.length > 0) ||
          (details.events && details.events.length > 0) ||
          (details.albumPhotos && details.albumPhotos.length > 0)
        ) {
          throw new BadRequestException(
            'When isFullPackage is true, no other selections (photos, events, albumPhotos) should be present',
          );
        }
      } else {
        const hasPhotos = details.photos && details.photos.length > 0;
        const hasEvents = details.events && details.events.length > 0;
        const hasAlbumPhotos =
          details.albumPhotos && details.albumPhotos.length > 0;

        if (!hasPhotos && !hasEvents && !hasAlbumPhotos) {
          throw new BadRequestException(
            'At least one selection type (photos, events, albumPhotos) is required when isFullPackage is false',
          );
        }
      }
    }
  }

  private validateShippingRequirement(
    cartItems: CartItem[],
    shippingDetails?: ShippingAddress,
  ): void {
    const requiresShipping = cartItems.some(
      (item) => item.productType !== 'DIGITAL_FILES',
    );

    if (requiresShipping && !shippingDetails) {
      throw new BadRequestException(
        'Shipping address is required for physical products (GENERIC or ALBUM)',
      );
    }
  }

  private async updateUserAddressIfDifferent(
    userId: string,
    shippingDetails: ShippingAddress,
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const addressChanged =
      user.zipCode !== shippingDetails.zipCode ||
      user.street !== shippingDetails.street ||
      user.number !== shippingDetails.number ||
      user.complement !== shippingDetails.complement ||
      user.neighborhood !== shippingDetails.neighborhood ||
      user.city !== shippingDetails.city ||
      user.state !== shippingDetails.state;

    if (addressChanged) {
      await this.userRepository.updateUser(userId, {
        zipCode: shippingDetails.zipCode,
        street: shippingDetails.street,
        number: shippingDetails.number,
        complement: shippingDetails.complement,
        neighborhood: shippingDetails.neighborhood,
        city: shippingDetails.city,
        state: shippingDetails.state,
      });
    }
  }

  private async validateCartItemPrices(
    userId: string,
    cartItems: CartItem[],
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.institution) {
      throw new Error('User or institution not found');
    }

    const institutionId = user.institution.id;

    for (const item of cartItems) {
      const institutionProduct =
        await this.institutionProductRepository.findByProductAndInstitution(
          item.productId,
          institutionId,
        );

      if (!institutionProduct) {
        throw new BadRequestException(
          `Product ${item.productId} not found for institution ${institutionId}`,
        );
      }

      const expectedUnitPrice = this.calculateExpectedPrice(
        institutionProduct.details,
        institutionProduct.flag,
        item.selectionDetails,
      );

      const expectedTotalPrice = new Decimal(expectedUnitPrice)
        .times(item.quantity)
        .toNumber();

      const receivedTotalPrice = new Decimal(item.totalPrice)
        .times(item.quantity)
        .toNumber();

      const priceDifference = new Decimal(expectedTotalPrice)
        .minus(receivedTotalPrice)
        .abs()
        .toNumber();

      if (priceDifference > 0.02) {
        throw new BadRequestException(
          `Invalid price for product ${
            item.productName
          }. Expected: R$ ${expectedTotalPrice.toFixed(
            2,
          )}, Received: R$ ${receivedTotalPrice.toFixed(2)}`,
        );
      }
    }
  }

  private calculateExpectedPrice(
    details: any,
    productType: string,
    selectionDetails: any,
  ): number {
    if (!details) {
      throw new BadRequestException('Product details not found');
    }

    switch (productType) {
      case 'ALBUM':
        return this.calculateAlbumPrice(
          details as AlbumDetails,
          selectionDetails,
        );
      case 'GENERIC':
        return this.calculateGenericPrice(
          details as GenericDetails,
          selectionDetails,
        );
      case 'DIGITAL_FILES':
        return this.calculateDigitalFilesPrice(
          details as DigitalFilesDetails,
          selectionDetails,
        );
      default:
        throw new BadRequestException(
          `Unsupported product type: ${productType}`,
        );
    }
  }

  private calculateAlbumPrice(
    details: AlbumDetails,
    selectionDetails: any,
  ): number {
    const photoCount = selectionDetails.albumPhotos?.length || 0;

    if (photoCount < details.minPhoto || photoCount > details.maxPhoto) {
      throw new BadRequestException(
        `Album photo count must be between ${details.minPhoto} and ${details.maxPhoto}`,
      );
    }

    return new Decimal(details.valorEncadernacao)
      .plus(new Decimal(photoCount).times(details.valorFoto))
      .toNumber();
  }

  private calculateGenericPrice(
    details: GenericDetails,
    selectionDetails: any,
  ): number {
    let totalPrice = new Decimal(0);

    if (selectionDetails.photos && selectionDetails.photos.length > 0) {
      for (const photo of selectionDetails.photos) {
        const event = details.events.find((e) => e.id === photo.eventId);
        if (
          !event ||
          event.valorPhoto === undefined ||
          event.valorPhoto === null
        ) {
          throw new BadRequestException(
            `Event ${photo.eventId} not found or has no unit price`,
          );
        }
        totalPrice = totalPrice.plus(event.valorPhoto);
      }
    }

    if (selectionDetails.events && selectionDetails.events.length > 0) {
      for (const selectedEvent of selectionDetails.events) {
        const event = details.events.find((e) => e.id === selectedEvent.id);
        if (!event) {
          throw new BadRequestException(`Event ${selectedEvent.id} not found`);
        }

        if (selectedEvent.isPackage) {
          if (event.valorPack === undefined || event.valorPack === null) {
            throw new BadRequestException(
              `Event ${selectedEvent.id} has no package price`,
            );
          }
          totalPrice = totalPrice.plus(event.valorPack);
        }
      }
    }

    return totalPrice.toNumber();
  }

  private calculateDigitalFilesPrice(
    details: DigitalFilesDetails,
    selectionDetails: any,
  ): number {
    if (selectionDetails.isFullPackage) {
      if (!details.valorPackTotal) {
        throw new BadRequestException('Full package price not configured');
      }
      return details.valorPackTotal;
    }

    let totalPrice = new Decimal(0);

    if (selectionDetails.photos && selectionDetails.photos.length > 0) {
      if (details.isAvailableUnit === false) {
        throw new BadRequestException(
          'Individual photo purchase not available',
        );
      }

      for (const photo of selectionDetails.photos) {
        const event = details.events?.find((e) => e.id === photo.eventId);
        if (
          !event ||
          event.valorPhoto === undefined ||
          event.valorPhoto === null
        ) {
          throw new BadRequestException(
            `Event ${photo.eventId} not found or has no unit price`,
          );
        }
        totalPrice = totalPrice.plus(event.valorPhoto);
      }
    }

    if (selectionDetails.events && selectionDetails.events.length > 0) {
      for (const selectedEvent of selectionDetails.events) {
        const event = details.events?.find((e) => e.id === selectedEvent.id);
        if (!event) {
          throw new BadRequestException(`Event ${selectedEvent.id} not found`);
        }

        if (selectedEvent.isPackage) {
          if (event.valorPack === undefined || event.valorPack === null) {
            throw new BadRequestException(
              `Event ${selectedEvent.id} has no package price`,
            );
          }
          totalPrice = totalPrice.plus(event.valorPack);
        }
      }
    }

    return totalPrice.toNumber();
  }
}
