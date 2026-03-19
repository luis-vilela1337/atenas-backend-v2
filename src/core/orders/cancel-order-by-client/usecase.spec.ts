import { Test, TestingModule } from '@nestjs/testing';
import { CancelOrderByClientUseCase } from './usecase';
import { OrderRepositoryInterface } from '../repositories/order.repository.interface';

describe('CancelOrderByClientUseCase', () => {
  let useCase: CancelOrderByClientUseCase;
  let orderRepo: jest.Mocked<OrderRepositoryInterface>;

  beforeEach(async () => {
    const mockOrderRepo = {
      createOrder: jest.fn(),
      findOrderById: jest.fn(),
      findOrderByPaymentGatewayId: jest.fn(),
      findOrdersByUserId: jest.fn(),
      findOrdersWithPagination: jest.fn(),
      updateOrderStatus: jest.fn(),
      updateOrderPaymentGatewayId: jest.fn(),
      markCreditRestored: jest.fn(),
      findAbandonedOrders: jest.fn(),
      cancelOrderAtomically: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancelOrderByClientUseCase,
        { provide: 'OrderRepositoryInterface', useValue: mockOrderRepo },
      ],
    }).compile();

    useCase = module.get(CancelOrderByClientUseCase);
    orderRepo = module.get('OrderRepositoryInterface');
  });

  it('GIVEN valid PENDING order WHEN client cancels THEN should return success with credit released', async () => {
    orderRepo.cancelOrderAtomically.mockResolvedValue({
      success: true,
      creditReleased: 150,
      newAvailableCredit: 500,
    });

    const result = await useCase.execute({
      orderId: 'order-123',
      userId: 'user-456',
    });

    expect(orderRepo.cancelOrderAtomically).toHaveBeenCalledWith(
      'order-123',
      'user-456',
    );
    expect(result.success).toBe(true);
    expect(result.creditReleased).toBe(150);
    expect(result.newAvailableCredit).toBe(500);
  });

  it('GIVEN order that does not belong to user WHEN client cancels THEN should propagate error', async () => {
    orderRepo.cancelOrderAtomically.mockRejectedValue(
      new Error('Pedido não encontrado ou não pertence ao usuário'),
    );

    await expect(
      useCase.execute({ orderId: 'order-123', userId: 'wrong-user' }),
    ).rejects.toThrow('Pedido não encontrado ou não pertence ao usuário');
  });

  it('GIVEN non-PENDING order WHEN client cancels THEN should propagate error', async () => {
    orderRepo.cancelOrderAtomically.mockRejectedValue(
      new Error('Pedido não pode ser cancelado (status: APPROVED)'),
    );

    await expect(
      useCase.execute({ orderId: 'order-123', userId: 'user-456' }),
    ).rejects.toThrow('Pedido não pode ser cancelado (status: APPROVED)');
  });

  it('GIVEN order with zero credit WHEN client cancels THEN should succeed with zero credit released', async () => {
    orderRepo.cancelOrderAtomically.mockResolvedValue({
      success: true,
      creditReleased: 0,
      newAvailableCredit: 0,
    });

    const result = await useCase.execute({
      orderId: 'order-123',
      userId: 'user-456',
    });

    expect(result.success).toBe(true);
    expect(result.creditReleased).toBe(0);
  });

  it('GIVEN database error WHEN cancelling THEN should propagate error (simulating rollback)', async () => {
    orderRepo.cancelOrderAtomically.mockRejectedValue(
      new Error('Database connection lost'),
    );

    await expect(
      useCase.execute({ orderId: 'order-123', userId: 'user-456' }),
    ).rejects.toThrow('Database connection lost');
  });
});
