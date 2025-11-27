import { ConfigService } from '@nestjs/config';
import { CreateOrderUseCase } from './usecase';
import { OrderRepositoryInterface } from '../repositories/order.repository.interface';
import { MercadoPagoRepositoryInterface } from '../../mercado-pago/repositories/mercado-pago.repository.interface';
import { UserSQLRepository } from '../../../infra/data/sql/repositories/user.repository';
import { InstitutionProductSQLRepository } from '../../../infra/data/sql/repositories/institution-product.repostitoy';
import { CreateOrderInput, Order, OrderStatus } from '../entities/order.entity';

describe('CreateOrderUseCase', () => {
  let useCase: CreateOrderUseCase;
  let orderRepository: jest.Mocked<OrderRepositoryInterface>;
  let mercadoPagoRepository: jest.Mocked<MercadoPagoRepositoryInterface>;
  let userRepository: jest.Mocked<UserSQLRepository>;
  let institutionProductRepository: jest.Mocked<InstitutionProductSQLRepository>;
  let configService: jest.Mocked<ConfigService>;

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

    useCase = new CreateOrderUseCase(
      orderRepository,
      mercadoPagoRepository,
      userRepository,
      institutionProductRepository,
      configService,
    );

    // Default mock setup - must be after mock creation
    userRepository.findById.mockResolvedValue({
      id: 'user-123',
      identifier: 'USER001',
      institution: {
        id: 'institution-123',
        contractNumber: 'INST001',
      },
    } as any);

    // Mock institution product with pricing details - default for all tests
    institutionProductRepository.findByProductAndInstitution.mockResolvedValue({
      id: 'inst-product-1',
      flag: 'GENERIC',
      details: {
        isAvailableUnit: true,
        events: [
          {
            id: 'event-1',
            valorPhoto: 100,
            valorPack: 500,
          },
        ],
      },
    } as any);

    // Note: mockResolvedValue can be overridden in individual tests
  });

  describe('FREE Payment Flow - R$ 0,00', () => {
    it('GIVEN order with R$ 0,00 WHEN executing THEN should create APPROVED order with BATATA_CHECKOUT_URL', async () => {
      // GIVEN
      const freeOrderInput = {
        ...mockInput,
        cartItems: [{ ...mockInput.cartItems[0], totalPrice: 0, quantity: 1 }],
      };

      // Mock price validation for free product
      institutionProductRepository.findByProductAndInstitution.mockResolvedValue(
        {
          id: 'inst-product-1',
          flag: 'GENERIC',
          details: {
            isAvailableUnit: true,
            events: [
              {
                id: 'event-1',
                valorPhoto: 0,
                valorPack: 0,
              },
            ],
          },
        } as any,
      );

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
        contractNumber: undefined,
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
        contractNumber: undefined,
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
        contractNumber: undefined,
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
        contractNumber: undefined,
        creditUsed: 50,
        remainingCredit: 0,
      });
      expect(userRepository.findUserCreditByUserId).toHaveBeenCalledWith(
        'user-123',
      );
      // Should deduct partial credit (50) before using Mercado Pago
      expect(userRepository.updateUserCredit).toHaveBeenCalledWith(
        'user-123',
        0,
      );
      expect(orderRepository.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentStatus: OrderStatus.PENDING,
          totalAmount: 100,
          creditUsed: 50,
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
        contractNumber: undefined,
        creditUsed: 0,
        remainingCredit: 0,
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

  describe('Quantity Calculation Tests', () => {
    it('GIVEN item with quantity > 1 WHEN creating order THEN should calculate total correctly', async () => {
      // GIVEN
      const multiQuantityInput = {
        ...mockInput,
        cartItems: [
          {
            ...mockInput.cartItems[0],
            totalPrice: 50, // Unit price
            quantity: 2, // 2 items
          },
        ],
      };

      // Mock institution product with correct price
      institutionProductRepository.findByProductAndInstitution.mockResolvedValue({
        id: 'inst-product-1',
        flag: 'GENERIC',
        details: {
          isAvailableUnit: true,
          events: [
            {
              id: 'event-1',
              valorPhoto: 50, // Must match totalPrice (unit price)
              valorPack: 500,
            },
          ],
        },
      } as any);

      userRepository.findUserCreditByUserId.mockResolvedValue(0);
      orderRepository.createOrder.mockResolvedValue({
        ...mockOrder,
        totalAmount: 100, // 50 * 2 = 100
        items: [
          {
            id: 'item-1',
            productId: 'product-1',
            productName: 'Test Product',
            productType: 'GENERIC',
            itemPrice: 50, // Unit price
            quantity: 2,
            details: [],
          },
        ],
      });
      mercadoPagoRepository.createPreference.mockResolvedValue({
        id: 'pref-123',
        checkoutUrl: 'https://mp.com/checkout',
      });

      // WHEN
      const result = await useCase.execute(multiQuantityInput);

      // THEN
      expect(orderRepository.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          totalAmount: 100, // 50 * 2
          items: expect.arrayContaining([
            expect.objectContaining({
              itemPrice: 50, // Unit price from frontend
              quantity: 2,
            }),
          ]),
        }),
      );

      expect(mercadoPagoRepository.createPreference).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              quantity: 2,
              unit_price: 50, // itemPrice is already unit price
            }),
          ]),
        }),
      );
    });

    it('GIVEN multiple items with different quantities WHEN creating order THEN should calculate totals correctly', async () => {
      // GIVEN
      const multiItemInput = {
        ...mockInput,
        cartItems: [
          {
            productId: 'product-1',
            productName: 'Product 1',
            productType: 'GENERIC' as const,
            totalPrice: 25, // Unit price
            quantity: 3, // 3 items = 75 total
            selectionDetails: {
              photos: [{ id: 'photo-1', eventId: 'event-1' }],
            },
          },
          {
            productId: 'product-2',
            productName: 'Product 2',
            productType: 'DIGITAL_FILES' as const,
            totalPrice: 50, // Unit price
            quantity: 2, // 2 items = 100 total
            selectionDetails: {
              photos: [{ id: 'photo-2', eventId: 'event-1' }],
            },
          },
        ],
      };

      // Mock institution product with correct prices for both products
      institutionProductRepository.findByProductAndInstitution.mockImplementation(
        (productId: string) => {
          if (productId === 'product-1') {
            return Promise.resolve({
              id: 'inst-product-1',
              flag: 'GENERIC',
              details: {
                isAvailableUnit: true,
                events: [
                  {
                    id: 'event-1',
                    valorPhoto: 25, // Must match product-1 unit price
                    valorPack: 500,
                  },
                ],
              },
            } as any);
          }
          return Promise.resolve({
            id: 'inst-product-2',
            flag: 'GENERIC',
            details: {
              isAvailableUnit: true,
              events: [
                {
                  id: 'event-1',
                  valorPhoto: 50, // Must match product-2 unit price
                  valorPack: 500,
                },
              ],
            },
          } as any);
        },
      );

      userRepository.findUserCreditByUserId.mockResolvedValue(0);
      orderRepository.createOrder.mockResolvedValue({
        ...mockOrder,
        totalAmount: 175, // 75 + 100 = 175
        items: [
          {
            id: 'item-1',
            productId: 'product-1',
            productName: 'Product 1',
            productType: 'GENERIC',
            itemPrice: 25, // Unit price
            quantity: 3,
            details: [],
          },
          {
            id: 'item-2',
            productId: 'product-2',
            productName: 'Product 2',
            productType: 'DIGITAL_FILES',
            itemPrice: 50, // Unit price
            quantity: 2,
            details: [],
          },
        ],
      });
      mercadoPagoRepository.createPreference.mockResolvedValue({
        id: 'pref-456',
        checkoutUrl: 'https://mp.com/checkout',
      });

      // WHEN
      await useCase.execute(multiItemInput);

      // THEN
      expect(orderRepository.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          totalAmount: 175, // (25 * 3) + (50 * 2)
          items: expect.arrayContaining([
            expect.objectContaining({
              productId: 'product-1',
              itemPrice: 25, // Unit price
              quantity: 3,
            }),
            expect.objectContaining({
              productId: 'product-2',
              itemPrice: 50, // Unit price
              quantity: 2,
            }),
          ]),
        }),
      );
    });
  });
});
