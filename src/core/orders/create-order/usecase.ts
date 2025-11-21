import {
  CreateOrderInput,
  CreateOrderResult,
  Order,
  OrderItemDetail,
  CartItem,
  ShippingAddress,
  OrderStatus,
} from '../entities/order.entity';
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
      // 1. Validate selection details consistency
      this.validateSelectionDetails(input.cartItems);

      // 2. Validate cart item prices against database
      await this.validateCartItemPrices(input.userId, input.cartItems);

      // 3. Validate shipping requirements
      this.validateShippingRequirement(input.cartItems, input.shippingDetails);

      // 2. Update user address if shipping details are provided and different
      if (input.shippingDetails) {
        await this.updateUserAddressIfDifferent(
          input.userId,
          input.shippingDetails,
        );
      }

      // 3. Calculate total amount
      const totalAmount = input.cartItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0,
      );

      // 4. Handle free orders
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

      // 5. Check user credit
      const userCredit = await this.userRepository.findUserCreditByUserId(
        input.userId,
      );

      // If credit covers the full amount
      if (userCredit >= totalAmount) {
        // Deduct credit
        await this.userRepository.updateUserCredit(
          input.userId,
          userCredit - totalAmount,
        );

        const order = await this.createOrder(
          input,
          totalAmount,
          OrderStatus.APPROVED,
          totalAmount, // creditUsed
        );
        return {
          orderId: order.id,
          checkoutUrl: this.configService.get('BATATA_CHECKOUT_URL'),
          paymentMethod: 'CREDIT',
          contractNumber: order.contractNumber,
          creditUsed: totalAmount,
          remainingCredit: userCredit - totalAmount,
        };
      }

      // 6. Mercado Pago flow with partial credit
      const creditToUse = userCredit > 0 ? userCredit : 0;
      const amountToPay = totalAmount - creditToUse;

      // Deduct available credit if any
      if (creditToUse > 0) {
        await this.userRepository.updateUserCredit(input.userId, 0);
      }

      const order = await this.createOrder(
        input,
        totalAmount,
        OrderStatus.PENDING,
        creditToUse, // creditUsed
      );

      // Create Mercado Pago preference with remaining amount
      const preference = this.createMercadoPagoPreference(
        order,
        input,
        amountToPay,
      );
      const mercadoPagoResult =
        await this.mercadoPagoRepository.createPreference(preference);

      // Update order with payment gateway ID
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
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  private async createOrder(
    input: CreateOrderInput,
    totalAmount: number,
    paymentStatus: OrderStatus,
    creditUsed?: number,
  ): Promise<Order> {
    // Generate contract number
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
        id: '', // Will be generated by repository
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

    // Handle full package selection (DIGITAL_FILES complete package)
    if (selectionDetails.isFullPackage) {
      details.push({
        id: '', // Will be generated by repository
        photoId: undefined,
        eventId: undefined,
        isPackage: true,
      });
      return details; // Return early for full package, no need to process individual items
    }

    // Handle photos selection (GENERIC and DIGITAL_FILES individual)
    if (selectionDetails.photos) {
      for (const photo of selectionDetails.photos) {
        details.push({
          id: '', // Will be generated by repository
          photoId: photo.id,
          eventId: photo.eventId,
          isPackage: undefined, // null for individual photos
        });
      }
    }

    // Handle events selection (DIGITAL_FILES packages)
    if (selectionDetails.events) {
      for (const event of selectionDetails.events) {
        details.push({
          id: '', // Will be generated by repository
          photoId: undefined,
          eventId: event.id,
          isPackage: event.isPackage,
        });
      }
    }

    // Handle album photos (ALBUM)
    if (selectionDetails.albumPhotos) {
      for (const photoId of selectionDetails.albumPhotos) {
        details.push({
          id: '', // Will be generated by repository
          photoId: photoId,
          eventId: undefined,
          isPackage: undefined, // null for album photos
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
    // If amountToPay is provided, adjust item prices proportionally
    const totalAmount = order.totalAmount;
    const paymentAmount = amountToPay ?? totalAmount;

    return {
      items: order.items.map((item) => {
        // Calculate adjusted price using Decimal.js
        const adjustedPrice =
          amountToPay !== undefined
            ? new Decimal(item.itemPrice)
                .times(paymentAmount)
                .div(totalAmount)
                .toNumber()
            : item.itemPrice;

        // Calculate unit price by dividing total price by quantity using Decimal.js
        const unitPrice = new Decimal(adjustedPrice)
          .div(item.quantity)
          .toNumber();

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
      externalReference: order.id, // Add order ID as external reference for webhook identification
    };
  }

  private async generateContractNumber(userId: string): Promise<string> {
    // Get user with institution data
    const user = await this.userRepository.findById(userId);

    if (!user || !user.institution) {
      throw new Error('User or institution not found');
    }

    return `${user.institution.contractNumber}-${user.identifier}`;
  }

  private async getOrderCountForYear(): Promise<number> {
    // This would need to be implemented in the repository
    // For now, using a simple timestamp-based approach
    return Math.floor(Math.random() * 100) + 1; // Placeholder - replace with actual repository call
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
          throw new Error(
            'When isFullPackage is true, no other selections (photos, events, albumPhotos) should be present',
          );
        }
      } else {
        const hasPhotos = details.photos && details.photos.length > 0;
        const hasEvents = details.events && details.events.length > 0;
        const hasAlbumPhotos =
          details.albumPhotos && details.albumPhotos.length > 0;

        if (!hasPhotos && !hasEvents && !hasAlbumPhotos) {
          throw new Error(
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
      throw new Error(
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
    // Get user to retrieve institutionId
    const user = await this.userRepository.findById(userId);
    if (!user || !user.institution) {
      throw new Error('User or institution not found');
    }

    const institutionId = user.institution.id;

    // Validate each cart item
    for (const item of cartItems) {
      // Fetch institution product from database
      const institutionProduct =
        await this.institutionProductRepository.findByProductAndInstitution(
          item.productId,
          institutionId,
        );

      if (!institutionProduct) {
        throw new Error(
          `Product ${item.productId} not found for institution ${institutionId}`,
        );
      }

      // Calculate expected unit price based on product type
      const expectedUnitPrice = this.calculateExpectedPrice(
        institutionProduct.details,
        institutionProduct.flag,
        item.selectionDetails,
      );

      // Calculate expected total price (unitPrice * quantity) using Decimal.js
      const expectedTotalPrice = new Decimal(expectedUnitPrice)
        .times(item.quantity)
        .toNumber();

      // Validate with tolerance for rounding (0.02 cents tolerance)
      const priceDifference = new Decimal(expectedTotalPrice)
        .minus(item.totalPrice)
        .abs()
        .toNumber();

      if (priceDifference > 0.02) {
        throw new Error(
          `Invalid price for product ${
            item.productName
          }. Expected: R$ ${expectedTotalPrice.toFixed(
            2,
          )}, Received: R$ ${item.totalPrice.toFixed(2)}`,
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
      throw new Error('Product details not found');
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
        throw new Error(`Unsupported product type: ${productType}`);
    }
  }

  private calculateAlbumPrice(
    details: AlbumDetails,
    selectionDetails: any,
  ): number {
    const photoCount = selectionDetails.albumPhotos?.length || 0;

    if (photoCount < details.minPhoto || photoCount > details.maxPhoto) {
      throw new Error(
        `Album photo count must be between ${details.minPhoto} and ${details.maxPhoto}`,
      );
    }

    // Use Decimal.js for precise calculation
    return new Decimal(details.valorEncadernacao)
      .plus(new Decimal(photoCount).times(details.valorFoto))
      .toNumber();
  }

  private calculateGenericPrice(
    details: GenericDetails,
    selectionDetails: any,
  ): number {
    let totalPrice = new Decimal(0);

    // Handle individual photos
    if (selectionDetails.photos && selectionDetails.photos.length > 0) {
      if (!details.isAvailableUnit) {
        throw new Error(
          'Individual photo purchase not available for this product',
        );
      }

      for (const photo of selectionDetails.photos) {
        const event = details.events.find((e) => e.id === photo.eventId);
        if (
          !event ||
          event.valorPhoto === undefined ||
          event.valorPhoto === null
        ) {
          throw new Error(
            `Event ${photo.eventId} not found or has no unit price`,
          );
        }
        totalPrice = totalPrice.plus(event.valorPhoto);
      }
    }

    // Handle event packages
    if (selectionDetails.events && selectionDetails.events.length > 0) {
      for (const selectedEvent of selectionDetails.events) {
        const event = details.events.find((e) => e.id === selectedEvent.id);
        if (!event) {
          throw new Error(`Event ${selectedEvent.id} not found`);
        }

        if (selectedEvent.isPackage) {
          if (event.valorPack === undefined || event.valorPack === null) {
            throw new Error(`Event ${selectedEvent.id} has no package price`);
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
    // Full package
    if (selectionDetails.isFullPackage) {
      if (!details.valorPackTotal) {
        throw new Error('Full package price not configured');
      }
      return details.valorPackTotal;
    }

    let totalPrice = new Decimal(0);

    // Individual photos
    if (selectionDetails.photos && selectionDetails.photos.length > 0) {
      if (!details.isAvailableUnit) {
        throw new Error('Individual photo purchase not available');
      }

      for (const photo of selectionDetails.photos) {
        const event = details.events?.find((e) => e.id === photo.eventId);
        if (
          !event ||
          event.valorPhoto === undefined ||
          event.valorPhoto === null
        ) {
          throw new Error(
            `Event ${photo.eventId} not found or has no unit price`,
          );
        }
        totalPrice = totalPrice.plus(event.valorPhoto);
      }
    }

    // Event packages
    if (selectionDetails.events && selectionDetails.events.length > 0) {
      for (const selectedEvent of selectionDetails.events) {
        const event = details.events?.find((e) => e.id === selectedEvent.id);
        if (!event) {
          throw new Error(`Event ${selectedEvent.id} not found`);
        }

        if (selectedEvent.isPackage) {
          if (event.valorPack === undefined || event.valorPack === null) {
            throw new Error(`Event ${selectedEvent.id} has no package price`);
          }
          totalPrice = totalPrice.plus(event.valorPack);
        }
      }
    }

    return totalPrice.toNumber();
  }
}
