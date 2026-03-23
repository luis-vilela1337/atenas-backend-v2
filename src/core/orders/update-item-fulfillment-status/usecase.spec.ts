import { UpdateItemFulfillmentStatusUseCase } from './usecase';
import { OrderRepository } from '@infrastructure/data/sql/repositories/order.repository';
import { UpdateOrderStatusUseCase } from '../update-order-status/usecase';
import { FulfillmentStatus, OrderStatus, Order } from '../entities/order.entity';

describe('UpdateItemFulfillmentStatusUseCase', () => {
  let useCase: UpdateItemFulfillmentStatusUseCase;
  let orderRepositoryMock: jest.Mocked<Partial<OrderRepository>>;
  let updateOrderStatusUseCaseMock: jest.Mocked<Partial<UpdateOrderStatusUseCase>>;

  beforeEach(() => {
    orderRepositoryMock = {
      findOrderById: jest.fn(),
      updateItemFulfillmentStatus: jest.fn(),
    };
    updateOrderStatusUseCaseMock = {
      execute: jest.fn(),
    };

    useCase = new UpdateItemFulfillmentStatusUseCase(
      orderRepositoryMock as unknown as OrderRepository,
      updateOrderStatusUseCaseMock as unknown as UpdateOrderStatusUseCase,
    );
  });

  const baseOrder: Partial<Order> = {
    id: 'order-123',
    paymentStatus: OrderStatus.APPROVED,
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        productName: 'Album 1',
        productType: 'ALBUM',
        itemPrice: 100,
        quantity: 1,
        fulfillmentStatus: FulfillmentStatus.PRODUCT_MANUFACTURED,
        details: [],
      },
      {
        id: 'item-2',
        productId: 'prod-2',
        productName: 'Digital 1',
        productType: 'DIGITAL_FILES',
        itemPrice: 50,
        quantity: 1,
        fulfillmentStatus: FulfillmentStatus.ORDER_RECEIVED,
        details: [],
      },
    ],
  };

  it('should update item fulfillment status and NOT complete order if other items are pending', async () => {
    const orderBeforeUpdate = { ...baseOrder } as Order;
    const orderAfterUpdate = {
      ...baseOrder,
      items: [
        {
          ...baseOrder.items![0],
          fulfillmentStatus: FulfillmentStatus.IN_TRANSIT,
        },
        baseOrder.items![1],
      ],
    } as Order;

    orderRepositoryMock.findOrderById
      ?.mockResolvedValueOnce(orderBeforeUpdate) // first fetch for validation
      .mockResolvedValueOnce(orderAfterUpdate); // second fetch after update

    await useCase.execute({
      orderId: 'order-123',
      orderItemId: 'item-1',
      fulfillmentStatus: FulfillmentStatus.IN_TRANSIT,
    });

    expect(orderRepositoryMock.updateItemFulfillmentStatus).toHaveBeenCalledWith(
      'item-1',
      FulfillmentStatus.IN_TRANSIT,
      undefined,
    );
    expect(updateOrderStatusUseCaseMock.execute).not.toHaveBeenCalled();
  });

  it('should complete the order if all items reach their terminal states', async () => {
    const orderBeforeUpdate = {
      ...baseOrder,
      items: [
        {
          ...baseOrder.items![0],
          fulfillmentStatus: FulfillmentStatus.IN_TRANSIT,
        },
        {
          ...baseOrder.items![1],
          fulfillmentStatus: FulfillmentStatus.SENT,
        },
      ],
    } as Order;

    const orderAfterUpdate = {
      ...baseOrder,
      items: [
        {
          ...baseOrder.items![0], // Updated to DELIVERED
          fulfillmentStatus: FulfillmentStatus.DELIVERED,
        },
        {
          ...baseOrder.items![1], // Already SENT
          fulfillmentStatus: FulfillmentStatus.SENT,
        },
      ],
    } as Order;

    orderRepositoryMock.findOrderById
      ?.mockResolvedValueOnce(orderBeforeUpdate)
      .mockResolvedValueOnce(orderAfterUpdate);

    await useCase.execute({
      orderId: 'order-123',
      orderItemId: 'item-1',
      fulfillmentStatus: FulfillmentStatus.DELIVERED,
    });

    expect(orderRepositoryMock.updateItemFulfillmentStatus).toHaveBeenCalledWith(
      'item-1',
      FulfillmentStatus.DELIVERED,
      expect.any(Date),
    );
    expect(updateOrderStatusUseCaseMock.execute).toHaveBeenCalledWith({
      orderId: 'order-123',
      paymentStatus: OrderStatus.COMPLETED,
    });
  });

  it('should throw error if order not found', async () => {
    orderRepositoryMock.findOrderById?.mockResolvedValue(null);

    await expect(
      useCase.execute({
        orderId: 'non-existent',
        orderItemId: 'item-1',
        fulfillmentStatus: FulfillmentStatus.IN_TRANSIT,
      }),
    ).rejects.toThrow('Order with ID non-existent not found');
  });

  it('should throw error if order payment status is not APPROVED or COMPLETED', async () => {
    orderRepositoryMock.findOrderById?.mockResolvedValue({
      ...baseOrder,
      paymentStatus: OrderStatus.PENDING,
    } as Order);

    await expect(
      useCase.execute({
        orderId: 'order-123',
        orderItemId: 'item-1',
        fulfillmentStatus: FulfillmentStatus.IN_TRANSIT,
      }),
    ).rejects.toThrow('Cannot update fulfillment for order with payment status PENDING');
  });

  it('should throw error if invalid transition', async () => {
    orderRepositoryMock.findOrderById?.mockResolvedValue(baseOrder as Order);

    // item-1 is PRODUCT_MANUFACTURED, valid next is IN_TRANSIT, trying DELIVERED
    await expect(
      useCase.execute({
        orderId: 'order-123',
        orderItemId: 'item-1',
        fulfillmentStatus: FulfillmentStatus.DELIVERED,
      }),
    ).rejects.toThrow('Invalid fulfillment transition for ALBUM: PRODUCT_MANUFACTURED → DELIVERED');
  });
});
