import { ConfigService } from '@nestjs/config';
import { CreateOrderUseCase } from './usecase';
import { OrderRepositoryInterface } from '../repositories/order.repository.interface';
import { MercadoPagoRepositoryInterface } from '../../mercado-pago/repositories/mercado-pago.repository.interface';
import { UserSQLRepository } from '../../../infra/data/sql/repositories/user.repository';
import { InstitutionProductSQLRepository } from '../../../infra/data/sql/repositories/institution-product.repostitoy';
import { CartRepositoryInterface } from '../../cart/repositories/cart.repository.interface';
import { CreateOrderInput, OrderStatus } from '../entities/order.entity';

describe('CreateOrderUseCase - Cart Integration', () => {
  let useCase: CreateOrderUseCase;
  let orderRepository: jest.Mocked<OrderRepositoryInterface>;
  let mercadoPagoRepository: jest.Mocked<MercadoPagoRepositoryInterface>;
  let userRepository: jest.Mocked<UserSQLRepository>;
  let institutionProductRepository: jest.Mocked<InstitutionProductSQLRepository>;
  let configService: jest.Mocked<ConfigService>;
  let cartRepository: jest.Mocked<CartRepositoryInterface>;

  const mockInput: CreateOrderInput = {
    userId: 'user-123',
    cartItems: [
      {
        productId: 'product-1',
        productName: 'Test Product',
        productType: 'GENERIC',
        totalPrice: 100,
        quantity: 1,
        selectionDetails: {
          photos: [{ id: 'photo-1', eventId: 'event-1' }],
        },
      },
    ],
    shippingDetails: {
      zipCode: '12345-678',
      street: 'Test Street',
      number: '123',
      neighborhood: 'Test Neighborhood',
      city: 'Test City',
      state: 'Test State',
    },
    payer: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: { areaCode: '11', number: '999999999' },
    },
  };

  const mockOrder = {
    id: 'order-123',
    displayId: 1,
    userId: 'user-123',
    totalAmount: 100,
    paymentStatus: OrderStatus.APPROVED,
    shippingAddress: mockInput.shippingDetails,
    items: [],
    createdAt: new Date(),
  };

  beforeEach(() => {
    orderRepository = {
      createOrder: jest.fn(),
      updateOrderPaymentGatewayId: jest.fn(),
      findOrderById: jest.fn(),
      findOrderByPaymentGatewayId: jest.fn(),
      findOrdersByUserId: jest.fn(),
      findOrdersWithPagination: jest.fn(),
      updateOrderStatus: jest.fn(),
      markCreditRestored: jest.fn(),
      findAbandonedOrders: jest.fn(),
    };

    mercadoPagoRepository = {
      createPreference: jest.fn(),
    };

    userRepository = {
      findUserCreditByUserId: jest.fn(),
      updateUserCredit: jest.fn(),
      deductCreditAtomic: jest.fn(),
      reserveCredit: jest.fn(),
      findById: jest.fn(),
      updateUser: jest.fn(),
    } as any;

    institutionProductRepository = {
      findByProductAndInstitution: jest.fn(),
      findById: jest.fn(),
      createInstitutionProduct: jest.fn(),
      findAllPaginated: jest.fn(),
      updateInstitutionProduct: jest.fn(),
      deleteInstitutionProduct: jest.fn(),
      findByInstitutionId: jest.fn(),
      findByProductId: jest.fn(),
    } as any;

    configService = {
      get: jest.fn(),
    } as any;

    cartRepository = {
      findByUserId: jest.fn(),
      upsert: jest.fn(),
      clearByUserId: jest.fn(),
      deleteAbandonedCarts: jest.fn(),
    };

    useCase = new CreateOrderUseCase(
      orderRepository,
      mercadoPagoRepository,
      userRepository,
      institutionProductRepository,
      configService,
      cartRepository,
    );

    userRepository.findById.mockResolvedValue({
      id: 'user-123',
      identifier: 'USER001',
      institution: {
        id: 'institution-123',
        contractNumber: 'INST001',
      },
    } as any);

    institutionProductRepository.findByProductAndInstitution.mockResolvedValue({
      id: 'inst-product-1',
      flag: 'GENERIC',
      details: {
        events: [{ id: 'event-1', valorPhoto: 100, valorPack: 500 }],
      },
    } as any);
  });

  describe('FREE Payment - Cart Clearing', () => {
    it('GIVEN FREE order WHEN created successfully THEN should clear cart', async () => {
      // Arrange
      const freeInput = {
        ...mockInput,
        cartItems: [{ ...mockInput.cartItems[0], totalPrice: 0 }],
      };
      institutionProductRepository.findByProductAndInstitution.mockResolvedValue({
        id: 'inst-product-1',
        flag: 'GENERIC',
        details: {
          events: [{ id: 'event-1', valorPhoto: 0, valorPack: 0 }],
        },
      } as any);
      configService.get.mockReturnValue('https://seudominio.com/success');
      orderRepository.createOrder.mockResolvedValue({ ...mockOrder, totalAmount: 0 });
      cartRepository.clearByUserId.mockResolvedValue(undefined);

      // Act
      await useCase.execute(freeInput);

      // Assert
      expect(cartRepository.clearByUserId).toHaveBeenCalledWith('user-123');
    });

    it('GIVEN FREE order WHEN cart clearing fails THEN should NOT break order creation', async () => {
      // Arrange
      const freeInput = {
        ...mockInput,
        cartItems: [{ ...mockInput.cartItems[0], totalPrice: 0 }],
      };
      institutionProductRepository.findByProductAndInstitution.mockResolvedValue({
        id: 'inst-product-1',
        flag: 'GENERIC',
        details: {
          events: [{ id: 'event-1', valorPhoto: 0, valorPack: 0 }],
        },
      } as any);
      configService.get.mockReturnValue('https://seudominio.com/success');
      orderRepository.createOrder.mockResolvedValue({ ...mockOrder, totalAmount: 0 });
      cartRepository.clearByUserId.mockRejectedValue(new Error('DB Error'));

      // Act
      const result = await useCase.execute(freeInput);

      // Assert - Order should still succeed despite cart error
      expect(result.orderId).toBe('order-123');
      expect(cartRepository.clearByUserId).toHaveBeenCalledWith('user-123');
    });
  });

  describe('CREDIT Payment - Cart Clearing', () => {
    it('GIVEN CREDIT order WHEN created successfully THEN should clear cart', async () => {
      // Arrange
      userRepository.findUserCreditByUserId.mockResolvedValue(150);
      userRepository.deductCreditAtomic.mockResolvedValue({
        success: true,
        previousCredit: 150,
        newCredit: 50,
      });
      configService.get.mockReturnValue('https://seudominio.com/success');
      orderRepository.createOrder.mockResolvedValue(mockOrder);
      cartRepository.clearByUserId.mockResolvedValue(undefined);

      // Act
      await useCase.execute(mockInput);

      // Assert
      expect(cartRepository.clearByUserId).toHaveBeenCalledWith('user-123');
    });
  });

  describe('MERCADO_PAGO Payment - No Cart Clearing', () => {
    it('GIVEN MERCADO_PAGO order WHEN created THEN should NOT clear cart', async () => {
      // Arrange
      userRepository.findUserCreditByUserId.mockResolvedValue(0);
      orderRepository.createOrder.mockResolvedValue({
        ...mockOrder,
        paymentStatus: OrderStatus.PENDING,
      });
      mercadoPagoRepository.createPreference.mockResolvedValue({
        id: 'mp-pref-123',
        checkoutUrl: 'https://mp.com/checkout',
      });

      // Act
      await useCase.execute(mockInput);

      // Assert - Cart should NOT be cleared for pending MP payments
      expect(cartRepository.clearByUserId).not.toHaveBeenCalled();
    });
  });

  describe('No CartRepository - Backward Compatibility', () => {
    it('GIVEN no cart repository injected WHEN creating order THEN should still work', async () => {
      // Arrange - Create use case without cart repository
      const useCaseWithoutCart = new CreateOrderUseCase(
        orderRepository,
        mercadoPagoRepository,
        userRepository,
        institutionProductRepository,
        configService,
        // no cartRepository
      );

      const freeInput = {
        ...mockInput,
        cartItems: [{ ...mockInput.cartItems[0], totalPrice: 0 }],
      };
      institutionProductRepository.findByProductAndInstitution.mockResolvedValue({
        id: 'inst-product-1',
        flag: 'GENERIC',
        details: {
          events: [{ id: 'event-1', valorPhoto: 0, valorPack: 0 }],
        },
      } as any);
      configService.get.mockReturnValue('https://seudominio.com/success');
      orderRepository.createOrder.mockResolvedValue({ ...mockOrder, totalAmount: 0 });

      // Act & Assert - Should not throw
      await expect(useCaseWithoutCart.execute(freeInput)).resolves.toBeDefined();
    });
  });
});
