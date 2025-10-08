import { ConfigService } from '@nestjs/config';
import { CreateOrderUseCase } from './usecase';
import { OrderRepositoryInterface } from '../repositories/order.repository.interface';
import { MercadoPagoRepositoryInterface } from '../../mercado-pago/repositories/mercado-pago.repository.interface';
import { UserSQLRepository } from '../../../infra/data/sql/repositories/user.repository';
import { CreateOrderInput, Order, OrderStatus } from '../entities/order.entity';

describe('CreateOrderUseCase', () => {
  let useCase: CreateOrderUseCase;
  let orderRepository: jest.Mocked<OrderRepositoryInterface>;
  let mercadoPagoRepository: jest.Mocked<MercadoPagoRepositoryInterface>;
  let userRepository: jest.Mocked<UserSQLRepository>;
  let configService: jest.Mocked<ConfigService>;

  const mockInput: CreateOrderInput = {
    userId: 'user-123',
    cartItems: [
      {
        productId: 'product-1',
        productName: 'Test Product',
        productType: 'GENERIC',
        totalPrice: 100,
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

  const mockOrder: Order = {
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
    };

    mercadoPagoRepository = {
      createPreference: jest.fn(),
    };

    userRepository = {
      findUserCreditByUserId: jest.fn(),
      updateUserCredit: jest.fn(),
      findById: jest.fn(),
      updateUser: jest.fn(),
    } as any;

    configService = {
      get: jest.fn(),
    } as any;

    useCase = new CreateOrderUseCase(
      orderRepository,
      mercadoPagoRepository,
      userRepository,
      configService,
    );

    // Default mock setup
    userRepository.findById.mockResolvedValue({
      id: 'user-123',
      identifier: 'USER001',
      institution: {
        contractNumber: 'INST001',
      },
    } as any);
  });

  describe('FREE Payment Flow - R$ 0,00', () => {
    it('GIVEN order with R$ 0,00 WHEN executing THEN should create APPROVED order with BATATA_CHECKOUT_URL', async () => {
      // GIVEN
      const freeOrderInput = {
        ...mockInput,
        cartItems: [{ ...mockInput.cartItems[0], totalPrice: 0 }],
      };

      configService.get.mockReturnValue('https://seudominio.com/success');
      orderRepository.createOrder.mockResolvedValue({
        ...mockOrder,
        totalAmount: 0,
      });

      // WHEN
      const result = await useCase.execute(freeOrderInput);

      // THEN
      expect(result).toEqual({
        orderId: 'order-123',
        checkoutUrl: 'https://seudominio.com/success',
        paymentMethod: 'FREE',
      });
      expect(orderRepository.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentStatus: OrderStatus.APPROVED,
          totalAmount: 0,
        }),
      );
      expect(configService.get).toHaveBeenCalledWith('BATATA_CHECKOUT_URL');
      expect(userRepository.findUserCreditByUserId).not.toHaveBeenCalled();
      expect(mercadoPagoRepository.createPreference).not.toHaveBeenCalled();
    });
  });

  describe('CREDIT Payment Flow - Sufficient Credit', () => {
    it('GIVEN user has sufficient credit WHEN executing THEN should deduct credit and create APPROVED order', async () => {
      // GIVEN
      const userCredit = 150;

      userRepository.findUserCreditByUserId.mockResolvedValue(userCredit);
      configService.get.mockReturnValue('https://seudominio.com/success');
      orderRepository.createOrder.mockResolvedValue(mockOrder);

      // WHEN
      const result = await useCase.execute(mockInput);

      // THEN
      expect(result).toEqual({
        orderId: 'order-123',
        checkoutUrl: 'https://seudominio.com/success',
        paymentMethod: 'CREDIT',
        creditUsed: 100,
        remainingCredit: 50,
      });
      expect(userRepository.findUserCreditByUserId).toHaveBeenCalledWith(
        'user-123',
      );
      expect(userRepository.updateUserCredit).toHaveBeenCalledWith(
        'user-123',
        50,
      );
      expect(orderRepository.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentStatus: OrderStatus.APPROVED,
          totalAmount: 100,
        }),
      );
      expect(mercadoPagoRepository.createPreference).not.toHaveBeenCalled();
    });

    it('GIVEN user has exact credit amount WHEN executing THEN should use all credit', async () => {
      // GIVEN
      const userCredit = 100;

      userRepository.findUserCreditByUserId.mockResolvedValue(userCredit);
      configService.get.mockReturnValue('https://seudominio.com/success');
      orderRepository.createOrder.mockResolvedValue(mockOrder);

      // WHEN
      const result = await useCase.execute(mockInput);

      // THEN
      expect(result).toEqual({
        orderId: 'order-123',
        checkoutUrl: 'https://seudominio.com/success',
        paymentMethod: 'CREDIT',
        creditUsed: 100,
        remainingCredit: 0,
      });
      expect(userRepository.updateUserCredit).toHaveBeenCalledWith(
        'user-123',
        0,
      );
    });
  });

  describe('MERCADO_PAGO Payment Flow - Insufficient Credit', () => {
    it('GIVEN user has insufficient credit WHEN executing THEN should use Mercado Pago flow', async () => {
      // GIVEN
      const userCredit = 50;

      userRepository.findUserCreditByUserId.mockResolvedValue(userCredit);
      orderRepository.createOrder.mockResolvedValue({
        ...mockOrder,
        paymentStatus: OrderStatus.PENDING,
      });
      mercadoPagoRepository.createPreference.mockResolvedValue({
        id: 'mp-preference-123',
        checkoutUrl: 'https://mercadopago.com/checkout/123',
      });

      // WHEN
      const result = await useCase.execute(mockInput);

      // THEN
      expect(result).toEqual({
        orderId: 'order-123',
        checkoutUrl: 'https://mercadopago.com/checkout/123',
        paymentMethod: 'MERCADO_PAGO',
      });
      expect(userRepository.findUserCreditByUserId).toHaveBeenCalledWith(
        'user-123',
      );
      expect(userRepository.updateUserCredit).not.toHaveBeenCalled();
      expect(orderRepository.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentStatus: OrderStatus.PENDING,
          totalAmount: 100,
        }),
      );
      expect(mercadoPagoRepository.createPreference).toHaveBeenCalled();
      expect(orderRepository.updateOrderPaymentGatewayId).toHaveBeenCalledWith(
        'order-123',
        'mp-preference-123',
      );
    });

    it('GIVEN user has zero credit WHEN executing THEN should use Mercado Pago flow', async () => {
      // GIVEN
      const userCredit = 0;

      userRepository.findUserCreditByUserId.mockResolvedValue(userCredit);
      orderRepository.createOrder.mockResolvedValue({
        ...mockOrder,
        paymentStatus: OrderStatus.PENDING,
      });
      mercadoPagoRepository.createPreference.mockResolvedValue({
        id: 'mp-preference-456',
        checkoutUrl: 'https://mercadopago.com/checkout/456',
      });

      // WHEN
      const result = await useCase.execute(mockInput);

      // THEN
      expect(result).toEqual({
        orderId: 'order-123',
        checkoutUrl: 'https://mercadopago.com/checkout/456',
        paymentMethod: 'MERCADO_PAGO',
      });
      expect(userRepository.updateUserCredit).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('GIVEN repository error WHEN executing THEN should throw descriptive error', async () => {
      // GIVEN
      userRepository.findUserCreditByUserId.mockRejectedValue(
        new Error('Database connection failed'),
      );

      // WHEN & THEN
      await expect(useCase.execute(mockInput)).rejects.toThrow(
        'Failed to create order: Database connection failed',
      );
    });

    it('GIVEN Mercado Pago error WHEN executing THEN should throw descriptive error', async () => {
      // GIVEN
      userRepository.findUserCreditByUserId.mockResolvedValue(0);
      orderRepository.createOrder.mockResolvedValue(mockOrder);
      mercadoPagoRepository.createPreference.mockRejectedValue(
        new Error('MP API Error'),
      );

      // WHEN & THEN
      await expect(useCase.execute(mockInput)).rejects.toThrow(
        'Failed to create order: MP API Error',
      );
    });
  });
});
