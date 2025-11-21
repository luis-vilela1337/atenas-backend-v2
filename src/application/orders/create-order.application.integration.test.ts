import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { CreateOrderApplication } from './create-order.application';
import { CreateOrderUseCase } from '@core/orders/create-order/usecase';
import { OrderRepositoryInterface } from '@core/orders/repositories/order.repository.interface';
import { MercadoPagoRepositoryInterface } from '@core/mercado-pago/repositories/mercado-pago.repository.interface';
import { UserSQLRepository } from '../../infra/data/sql/repositories/user.repository';
import { InstitutionProductSQLRepository } from '../../infra/data/sql/repositories/institution-product.repostitoy';
import { CreateOrderDto } from '@presentation/orders/dto/create-order.dto';
import { OrderAdapter } from './adapters/order.adapter';
import {
  CreateOrderResult,
  OrderStatus,
} from '@core/orders/entities/order.entity';

describe('CreateOrderApplication - Integration Tests', () => {
  let createOrderApplication: CreateOrderApplication;
  let orderRepository: jest.Mocked<OrderRepositoryInterface>;
  let mercadoPagoRepository: jest.Mocked<MercadoPagoRepositoryInterface>;
  let userRepository: jest.Mocked<UserSQLRepository>;

  const mockOrderRepository = {
    createOrder: jest.fn(),
    updateOrderPaymentGatewayId: jest.fn(),
    findOrderById: jest.fn(),
    findOrderByPaymentGatewayId: jest.fn(),
    findOrdersByUserId: jest.fn(),
    findOrdersWithPagination: jest.fn(),
    updateOrderStatus: jest.fn(),
  };

  const mockMercadoPagoRepository = {
    createPreference: jest.fn(),
  };

  const mockUserRepository = {
    findUserCreditByUserId: jest.fn(),
    updateUserCredit: jest.fn(),
    findById: jest.fn(),
    updateUser: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
  };

  const mockInstitutionProductRepository = {
    findByProductAndInstitution: jest.fn(),
    findById: jest.fn(),
    createInstitutionProduct: jest.fn(),
    findAllPaginated: jest.fn(),
    updateInstitutionProduct: jest.fn(),
    deleteInstitutionProduct: jest.fn(),
    findByInstitutionId: jest.fn(),
    findByProductId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
      ],
      providers: [
        CreateOrderApplication,
        CreateOrderUseCase,
        {
          provide: 'OrderRepositoryInterface',
          useValue: mockOrderRepository,
        },
        {
          provide: 'MercadoPagoRepositoryInterface',
          useValue: mockMercadoPagoRepository,
        },
        {
          provide: UserSQLRepository,
          useValue: mockUserRepository,
        },
        {
          provide: InstitutionProductSQLRepository,
          useValue: mockInstitutionProductRepository,
        },
      ],
    }).compile();

    createOrderApplication = module.get<CreateOrderApplication>(
      CreateOrderApplication,
    );
    orderRepository = module.get('OrderRepositoryInterface');
    mercadoPagoRepository = module.get('MercadoPagoRepositoryInterface');
    userRepository = module.get(UserSQLRepository);

    // Default mocks
    mockUserRepository.findById.mockResolvedValue({
      id: 'user-123',
      identifier: 'USER001',
      institution: {
        id: 'institution-123',
        contractNumber: 'INST001',
      },
    } as any);

    // Mock institution product with default pricing
    mockInstitutionProductRepository.findByProductAndInstitution.mockResolvedValue(
      {
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
      } as any,
    );

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('🆓 FREE Payment Flow - R$ 0,00', () => {
    it('GIVEN order with total R$ 0,00 WHEN creating order THEN should create APPROVED order with BATATA_CHECKOUT_URL', async () => {
      // GIVEN
      const freeOrderDto: CreateOrderDto = {
        cartItems: [
          {
            productId: 'product-free-1',
            productName: 'Free Digital Photos',
            productType: 'DIGITAL_FILES',
            totalPrice: 0,
            quantity: 1,
            selectionDetails: {
              photos: [
                { id: 'photo-1', eventId: 'event-1' },
                { id: 'photo-2', eventId: 'event-1' },
              ],
            },
          },
        ],
        payer: {
          firstName: 'João',
          lastName: 'Silva',
          email: 'joao.test@email.com',
          phone: { areaCode: '11', number: '999999999' },
        },
      };

      const userId = 'user-free-test';
      const expectedOrder = {
        id: 'order-free-123',
        displayId: 1,
        userId,
        totalAmount: 0,
        paymentStatus: OrderStatus.APPROVED,
        contractNumber: '2025-001',
        contractUniqueId: '2025-001-1736251200000',
        createdAt: new Date(),
        items: [],
        shippingAddress: undefined,
      };

      const expectedResult: CreateOrderResult = {
        orderId: 'order-free-123',
        checkoutUrl: 'https://batata.com/success',
        paymentMethod: 'FREE',
        contractNumber: '2025-001',
      };

      // Mock environment variable
      process.env.BATATA_CHECKOUT_URL = 'https://batata.com/success';

      // Mock repository response
      orderRepository.createOrder.mockResolvedValue(expectedOrder);

      // WHEN
      const input = OrderAdapter.toCreateOrderInput(freeOrderDto, userId);
      const result = await createOrderApplication.execute(input);

      // THEN
      expect(result).toEqual(expectedResult);

      expect(orderRepository.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          totalAmount: 0,
          paymentStatus: OrderStatus.APPROVED,
        }),
      );

      // Should NOT check user credit for free orders
      expect(userRepository.findUserCreditByUserId).not.toHaveBeenCalled();
      expect(userRepository.updateUserCredit).not.toHaveBeenCalled();

      // Should NOT use Mercado Pago for free orders
      expect(mercadoPagoRepository.createPreference).not.toHaveBeenCalled();
    });

    it('GIVEN multiple free items totaling R$ 0,00 WHEN creating order THEN should process correctly', async () => {
      // GIVEN
      const multiFreOrderDto: CreateOrderDto = {
        cartItems: [
          {
            productId: 'product-1',
            productName: 'Free Item 1',
            productType: 'DIGITAL_FILES',
            totalPrice: 0,
            quantity: 1,
            selectionDetails: {
              photos: [{ id: 'photo-1', eventId: 'event-1' }],
            },
          },
          {
            productId: 'product-2',
            productName: 'Free Item 2',
            productType: 'DIGITAL_FILES',
            totalPrice: 0,
            quantity: 1,
            selectionDetails: {
              photos: [{ id: 'photo-2', eventId: 'event-2' }],
            },
          },
        ],
        payer: {
          firstName: 'Maria',
          lastName: 'Santos',
          email: 'maria.test@email.com',
          phone: { areaCode: '21', number: '888888888' },
        },
      };

      const expectedOrder = {
        id: 'order-multi-free-456',
        displayId: 2,
        userId: 'user-multi-free',
        totalAmount: 0,
        paymentStatus: OrderStatus.APPROVED,
        contractNumber: '2025-002',
        createdAt: new Date(),
        items: [],
        shippingAddress: undefined,
      };

      process.env.BATATA_CHECKOUT_URL = 'https://batata.com/success';
      orderRepository.createOrder.mockResolvedValue(expectedOrder);

      // WHEN
      const input = OrderAdapter.toCreateOrderInput(
        multiFreOrderDto,
        'user-multi-free',
      );
      const result = await createOrderApplication.execute(input);

      // THEN
      expect(result.orderId).toBe('order-multi-free-456');
      expect(orderRepository.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          totalAmount: 0,
          paymentStatus: OrderStatus.APPROVED,
        }),
      );
    });
  });

  describe('💳 CREDIT Payment Flow - Sufficient Credit', () => {
    it('GIVEN user has sufficient credit WHEN creating order THEN should deduct credit and create APPROVED order', async () => {
      // GIVEN
      const creditOrderDto: CreateOrderDto = {
        cartItems: [
          {
            productId: 'product-credit-1',
            productName: 'Premium Photo Package',
            productType: 'GENERIC',
            totalPrice: 150,
            quantity: 1,
            selectionDetails: {
              photos: [
                { id: 'photo-1', eventId: 'event-1' },
                { id: 'photo-2', eventId: 'event-1' },
              ],
            },
          },
        ],
        shippingDetails: {
          zipCode: '01234-567',
          street: 'Rua das Flores',
          number: '123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
        },
        payer: {
          firstName: 'Carlos',
          lastName: 'Lima',
          email: 'carlos.test@email.com',
          phone: { areaCode: '11', number: '777777777' },
        },
      };

      const userId = 'user-credit-test';
      const userCredit = 200; // Sufficient credit
      const expectedOrder = {
        id: 'order-credit-789',
        displayId: 3,
        userId,
        totalAmount: 150,
        paymentStatus: OrderStatus.APPROVED,
        contractNumber: '2025-003',
        createdAt: new Date(),
        items: [],
        shippingAddress: {
          zipCode: '01234-567',
          street: 'Rua das Flores',
          number: '123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
        },
      };

      const expectedResult: CreateOrderResult = {
        orderId: 'order-credit-789',
        checkoutUrl: 'https://batata.com/success',
        paymentMethod: 'CREDIT',
        contractNumber: '2025-003',
        creditUsed: 150,
        remainingCredit: 50,
      };

      process.env.BATATA_CHECKOUT_URL = 'https://batata.com/success';
      userRepository.findUserCreditByUserId.mockResolvedValue(userCredit);
      orderRepository.createOrder.mockResolvedValue(expectedOrder);

      // WHEN
      const input = OrderAdapter.toCreateOrderInput(creditOrderDto, userId);
      const result = await createOrderApplication.execute(input);

      // THEN
      expect(result).toEqual(expectedResult);

      // Should check and deduct user credit
      expect(userRepository.findUserCreditByUserId).toHaveBeenCalledWith(
        userId,
      );
      expect(userRepository.updateUserCredit).toHaveBeenCalledWith(userId, 50); // 200 - 150

      expect(orderRepository.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          totalAmount: 150,
          paymentStatus: OrderStatus.APPROVED,
        }),
      );

      // Should NOT use Mercado Pago when credit is sufficient
      expect(mercadoPagoRepository.createPreference).not.toHaveBeenCalled();
    });

    it('GIVEN user has exact credit amount WHEN creating order THEN should use all credit leaving zero balance', async () => {
      // GIVEN
      const exactCreditOrderDto: CreateOrderDto = {
        cartItems: [
          {
            productId: 'product-exact-1',
            productName: 'Exact Credit Product',
            productType: 'ALBUM',
            totalPrice: 100,
            quantity: 1,
            selectionDetails: {
              albumPhotos: ['photo-1', 'photo-2', 'photo-3'],
            },
          },
        ],
        shippingDetails: {
          zipCode: '98765-432',
          street: 'Av. Principal',
          number: '456',
          neighborhood: 'Jardim',
          city: 'Rio de Janeiro',
          state: 'RJ',
        },
        payer: {
          firstName: 'Ana',
          lastName: 'Costa',
          email: 'ana.test@email.com',
          phone: { areaCode: '21', number: '666666666' },
        },
      };

      const userId = 'user-exact-credit';
      const userCredit = 100; // Exact credit amount
      const expectedOrder = {
        id: 'order-exact-credit-101',
        displayId: 4,
        userId,
        totalAmount: 100,
        paymentStatus: OrderStatus.APPROVED,
        contractNumber: '2025-004',
        createdAt: new Date(),
        items: [],
        shippingAddress: {
          zipCode: '98765-432',
          street: 'Av. Principal',
          number: '456',
          neighborhood: 'Jardim',
          city: 'Rio de Janeiro',
          state: 'RJ',
        },
      };

      process.env.BATATA_CHECKOUT_URL = 'https://batata.com/success';
      userRepository.findUserCreditByUserId.mockResolvedValue(userCredit);
      orderRepository.createOrder.mockResolvedValue(expectedOrder);

      // WHEN
      const input = OrderAdapter.toCreateOrderInput(
        exactCreditOrderDto,
        userId,
      );
      await createOrderApplication.execute(input);

      // THEN
      expect(userRepository.updateUserCredit).toHaveBeenCalledWith(userId, 0); // Exactly zero remaining
      expect(orderRepository.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          totalAmount: 100,
          paymentStatus: OrderStatus.APPROVED,
        }),
      );
    });
  });

  describe('🏪 MERCADO_PAGO Payment Flow - Insufficient Credit', () => {
    it('GIVEN user has insufficient credit WHEN creating order THEN should use Mercado Pago flow', async () => {
      // GIVEN
      const mpOrderDto: CreateOrderDto = {
        cartItems: [
          {
            productId: 'product-mp-1',
            productName: 'Expensive Photo Package',
            productType: 'GENERIC',
            totalPrice: 500,
            quantity: 1,
            selectionDetails: {
              photos: [
                { id: 'photo-1', eventId: 'event-1' },
                { id: 'photo-2', eventId: 'event-1' },
              ],
            },
          },
        ],
        shippingDetails: {
          zipCode: '54321-098',
          street: 'Rua Nova',
          number: '789',
          neighborhood: 'Bela Vista',
          city: 'Belo Horizonte',
          state: 'MG',
        },
        payer: {
          firstName: 'Pedro',
          lastName: 'Oliveira',
          email: 'pedro.test@email.com',
          phone: { areaCode: '31', number: '555555555' },
        },
      };

      const userId = 'user-insufficient-credit';
      const userCredit = 100; // Insufficient credit (need 500)
      const expectedOrder = {
        id: 'order-mp-202',
        displayId: 5,
        userId,
        totalAmount: 500,
        paymentStatus: OrderStatus.PENDING,
        contractNumber: '2025-005',
        createdAt: new Date(),
        items: [],
        shippingAddress: {
          zipCode: '54321-098',
          street: 'Rua Nova',
          number: '789',
          neighborhood: 'Bela Vista',
          city: 'Belo Horizonte',
          state: 'MG',
        },
      };

      const mpResponse = {
        id: 'mp-preference-xyz789',
        checkoutUrl: 'https://mercadopago.com/checkout/xyz789',
      };

      const expectedResult: CreateOrderResult = {
        orderId: 'order-mp-202',
        checkoutUrl: 'https://mercadopago.com/checkout/xyz789',
        paymentMethod: 'MERCADO_PAGO',
        contractNumber: '2025-005',
      };

      userRepository.findUserCreditByUserId.mockResolvedValue(userCredit);
      orderRepository.createOrder.mockResolvedValue(expectedOrder);
      mercadoPagoRepository.createPreference.mockResolvedValue(mpResponse);

      // WHEN
      const input = OrderAdapter.toCreateOrderInput(mpOrderDto, userId);
      const result = await createOrderApplication.execute(input);

      // THEN
      expect(result).toEqual(expectedResult);

      // Should check credit but NOT deduct (insufficient)
      expect(userRepository.findUserCreditByUserId).toHaveBeenCalledWith(
        userId,
      );
      expect(userRepository.updateUserCredit).not.toHaveBeenCalled();

      // Should create PENDING order and use Mercado Pago
      expect(orderRepository.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          totalAmount: 500,
          paymentStatus: OrderStatus.PENDING,
        }),
      );

      expect(mercadoPagoRepository.createPreference).toHaveBeenCalled();
      expect(orderRepository.updateOrderPaymentGatewayId).toHaveBeenCalledWith(
        'order-mp-202',
        'mp-preference-xyz789',
      );
    });

    it('GIVEN user has zero credit WHEN creating order THEN should use Mercado Pago flow', async () => {
      // GIVEN
      const zeroCreditOrderDto: CreateOrderDto = {
        cartItems: [
          {
            productId: 'product-zero-1',
            productName: 'Standard Package',
            productType: 'DIGITAL_FILES',
            totalPrice: 25.5,
            quantity: 1,
            selectionDetails: {
              events: [{ id: 'event-1', isPackage: true }],
            },
          },
        ],
        payer: {
          firstName: 'Lucia',
          lastName: 'Ferreira',
          email: 'lucia.test@email.com',
          phone: { areaCode: '85', number: '444444444' },
        },
      };

      const userId = 'user-zero-credit';
      const userCredit = 0;
      const expectedOrder = {
        id: 'order-zero-303',
        displayId: 6,
        userId,
        totalAmount: 25.5,
        paymentStatus: OrderStatus.PENDING,
        contractNumber: '2025-006',
        createdAt: new Date(),
        items: [],
        shippingAddress: undefined,
      };

      const mpResponse = {
        id: 'mp-preference-abc123',
        checkoutUrl: 'https://mercadopago.com/checkout/abc123',
      };

      userRepository.findUserCreditByUserId.mockResolvedValue(userCredit);
      orderRepository.createOrder.mockResolvedValue(expectedOrder);
      mercadoPagoRepository.createPreference.mockResolvedValue(mpResponse);

      // WHEN
      const input = OrderAdapter.toCreateOrderInput(zeroCreditOrderDto, userId);
      const result = await createOrderApplication.execute(input);

      // THEN
      expect(result.checkoutUrl).toBe(
        'https://mercadopago.com/checkout/abc123',
      );
      expect(userRepository.updateUserCredit).not.toHaveBeenCalled();
      expect(mercadoPagoRepository.createPreference).toHaveBeenCalled();
    });
  });

  describe('📦 Shipping Validation Tests', () => {
    it('GIVEN physical product (GENERIC) without shipping details WHEN creating order THEN should throw validation error', async () => {
      // GIVEN
      const physicalOrderWithoutShipping: CreateOrderDto = {
        cartItems: [
          {
            productId: 'product-physical-1',
            productName: 'Physical Photo Print',
            productType: 'GENERIC', // Requires shipping
            totalPrice: 50,
            quantity: 1,
            selectionDetails: {
              photos: [{ id: 'photo-1', eventId: 'event-1' }],
            },
          },
        ],
        // Missing shippingDetails!
        payer: {
          firstName: 'Roberto',
          lastName: 'Silva',
          email: 'roberto.test@email.com',
          phone: { areaCode: '47', number: '333333333' },
        },
      };

      const userId = 'user-no-shipping';
      userRepository.findUserCreditByUserId.mockResolvedValue(0);

      // WHEN & THEN
      const input = OrderAdapter.toCreateOrderInput(
        physicalOrderWithoutShipping,
        userId,
      );
      await expect(createOrderApplication.execute(input)).rejects.toThrow(
        'Shipping address is required for physical products (GENERIC or ALBUM)',
      );

      // Should not create any order or process payment
      expect(orderRepository.createOrder).not.toHaveBeenCalled();
      expect(mercadoPagoRepository.createPreference).not.toHaveBeenCalled();
    });

    it('GIVEN album product (ALBUM) without shipping details WHEN creating order THEN should throw validation error', async () => {
      // GIVEN
      const albumOrderWithoutShipping: CreateOrderDto = {
        cartItems: [
          {
            productId: 'product-album-1',
            productName: 'Photo Album',
            productType: 'ALBUM', // Requires shipping
            totalPrice: 120,
            quantity: 1,
            selectionDetails: {
              albumPhotos: ['photo-1', 'photo-2'],
            },
          },
        ],
        // Missing shippingDetails!
        payer: {
          firstName: 'Fernanda',
          lastName: 'Costa',
          email: 'fernanda.test@email.com',
          phone: { areaCode: '48', number: '222222222' },
        },
      };

      const userId = 'user-album-no-shipping';
      userRepository.findUserCreditByUserId.mockResolvedValue(0);

      // WHEN & THEN
      const input = OrderAdapter.toCreateOrderInput(
        albumOrderWithoutShipping,
        userId,
      );
      await expect(createOrderApplication.execute(input)).rejects.toThrow(
        'Shipping address is required for physical products (GENERIC or ALBUM)',
      );
    });

    it('GIVEN digital product (DIGITAL_FILES) without shipping details WHEN creating order THEN should process successfully', async () => {
      // GIVEN
      const digitalOrderWithoutShipping: CreateOrderDto = {
        cartItems: [
          {
            productId: 'product-digital-1',
            productName: 'Digital Photos Package',
            productType: 'DIGITAL_FILES', // Does NOT require shipping
            totalPrice: 30,
            quantity: 1,
            selectionDetails: {
              photos: [{ id: 'photo-1', eventId: 'event-1' }],
            },
          },
        ],
        // No shippingDetails - should be OK for digital products
        payer: {
          firstName: 'Gabriel',
          lastName: 'Santos',
          email: 'gabriel.test@email.com',
          phone: { areaCode: '11', number: '111111111' },
        },
      };

      const userId = 'user-digital-no-shipping';
      const userCredit = 0;
      const expectedOrder = {
        id: 'order-digital-404',
        displayId: 7,
        userId,
        totalAmount: 30,
        paymentStatus: OrderStatus.PENDING,
        contractNumber: '2025-007',
        createdAt: new Date(),
        items: [],
        shippingAddress: undefined,
      };

      const mpResponse = {
        id: 'mp-preference-digital123',
        checkoutUrl: 'https://mercadopago.com/checkout/digital123',
      };

      userRepository.findUserCreditByUserId.mockResolvedValue(userCredit);
      orderRepository.createOrder.mockResolvedValue(expectedOrder);
      mercadoPagoRepository.createPreference.mockResolvedValue(mpResponse);

      // WHEN
      const input = OrderAdapter.toCreateOrderInput(
        digitalOrderWithoutShipping,
        userId,
      );
      const result = await createOrderApplication.execute(input);

      // THEN
      expect(result.orderId).toBe('order-digital-404');
      expect(orderRepository.createOrder).toHaveBeenCalled();
    });

    it('GIVEN mixed cart (digital + physical) without shipping details WHEN creating order THEN should throw validation error', async () => {
      // GIVEN
      const mixedCartWithoutShipping: CreateOrderDto = {
        cartItems: [
          {
            productId: 'product-digital-1',
            productName: 'Digital Photos',
            productType: 'DIGITAL_FILES', // No shipping required
            totalPrice: 20,
            quantity: 1,
            selectionDetails: {
              photos: [{ id: 'photo-1', eventId: 'event-1' }],
            },
          },
          {
            productId: 'product-physical-1',
            productName: 'Printed Photos',
            productType: 'GENERIC', // Shipping required!
            totalPrice: 40,
            quantity: 1,
            selectionDetails: {
              photos: [{ id: 'photo-2', eventId: 'event-2' }],
            },
          },
        ],
        // Missing shippingDetails - should fail because of physical product
        payer: {
          firstName: 'Isabella',
          lastName: 'Lima',
          email: 'isabella.test@email.com',
          phone: { areaCode: '62', number: '999999999' },
        },
      };

      const userId = 'user-mixed-no-shipping';
      userRepository.findUserCreditByUserId.mockResolvedValue(0);

      // WHEN & THEN
      const input = OrderAdapter.toCreateOrderInput(
        mixedCartWithoutShipping,
        userId,
      );
      await expect(createOrderApplication.execute(input)).rejects.toThrow(
        'Shipping address is required for physical products (GENERIC or ALBUM)',
      );

      expect(orderRepository.createOrder).not.toHaveBeenCalled();
    });
  });

  describe('🐛 Error Handling', () => {
    it('GIVEN repository error WHEN creating order THEN should throw descriptive error', async () => {
      // GIVEN
      const orderDto: CreateOrderDto = {
        cartItems: [
          {
            productId: 'product-error-1',
            productName: 'Error Test Product',
            productType: 'DIGITAL_FILES',
            totalPrice: 25,
            quantity: 1,
            selectionDetails: {
              photos: [{ id: 'photo-1', eventId: 'event-1' }],
            },
          },
        ],
        payer: {
          firstName: 'Error',
          lastName: 'Test',
          email: 'error.test@email.com',
          phone: { areaCode: '11', number: '999999999' },
        },
      };

      const userId = 'user-error-test';

      userRepository.findUserCreditByUserId.mockRejectedValue(
        new Error('Database connection failed'),
      );

      // WHEN & THEN
      const input = OrderAdapter.toCreateOrderInput(orderDto, userId);
      await expect(createOrderApplication.execute(input)).rejects.toThrow(
        'Failed to create order: Database connection failed',
      );
    });

    it('GIVEN Mercado Pago API error WHEN creating order THEN should throw descriptive error', async () => {
      // GIVEN
      const orderDto: CreateOrderDto = {
        cartItems: [
          {
            productId: 'product-mp-error-1',
            productName: 'MP Error Test Product',
            productType: 'DIGITAL_FILES',
            totalPrice: 75,
            quantity: 1,
            selectionDetails: {
              photos: [{ id: 'photo-1', eventId: 'event-1' }],
            },
          },
        ],
        payer: {
          firstName: 'MP',
          lastName: 'Error',
          email: 'mp.error@email.com',
          phone: { areaCode: '11', number: '888888888' },
        },
      };

      const userId = 'user-mp-error';
      const expectedOrder = {
        id: 'order-mp-error-505',
        displayId: 8,
        userId,
        totalAmount: 75,
        paymentStatus: OrderStatus.PENDING,
        contractNumber: '2025-008',
        createdAt: new Date(),
        items: [],
        shippingAddress: undefined,
      };

      userRepository.findUserCreditByUserId.mockResolvedValue(0);
      orderRepository.createOrder.mockResolvedValue(expectedOrder);
      mercadoPagoRepository.createPreference.mockRejectedValue(
        new Error('MP API Error: Invalid preference data'),
      );

      // WHEN & THEN
      const input = OrderAdapter.toCreateOrderInput(orderDto, userId);
      await expect(createOrderApplication.execute(input)).rejects.toThrow(
        'Failed to create order: MP API Error: Invalid preference data',
      );
    });
  });
});
