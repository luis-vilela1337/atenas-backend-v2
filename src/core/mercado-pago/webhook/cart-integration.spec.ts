import { ProcessWebhookUseCase, ProcessWebhookInput } from './process-webhook.usecase';
import { WebhookRepositoryInterface } from '../repositories/webhook.repository.interface';
import { OrderRepositoryInterface } from '../../orders/repositories/order.repository.interface';
import { UserSQLRepository } from '../../../infra/data/sql/repositories/user.repository';
import { CartRepositoryInterface } from '../../cart/repositories/cart.repository.interface';
import { OrderStatus } from '../../orders/entities/order.entity';

describe('ProcessWebhookUseCase - Cart Integration', () => {
  let useCase: ProcessWebhookUseCase;
  let webhookRepository: jest.Mocked<WebhookRepositoryInterface>;
  let orderRepository: jest.Mocked<OrderRepositoryInterface>;
  let userRepository: jest.Mocked<UserSQLRepository>;
  let cartRepository: jest.Mocked<CartRepositoryInterface>;

  const baseInput: ProcessWebhookInput = {
    id: 'webhook-123',
    type: 'payment',
    dataId: 'payment-456',
    liveMode: true,
    dateCreated: new Date().toISOString(),
    userId: 'user-mp-123',
    apiVersion: 'v1',
    action: 'payment.created',
    rawData: {},
  };

  beforeEach(() => {
    webhookRepository = {
      findNotificationById: jest.fn(),
      saveNotification: jest.fn(),
      getPaymentDetails: jest.fn(),
      getMerchantOrderDetails: jest.fn(),
      updatePaymentStatus: jest.fn(),
    } as any;

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
      cancelOrderAtomically: jest.fn(),
    };

    userRepository = {
      consumeReservedCredit: jest.fn(),
      releaseReservedCredit: jest.fn(),
    } as any;

    cartRepository = {
      findByUserId: jest.fn(),
      upsert: jest.fn(),
      clearByUserId: jest.fn(),
      deleteAbandonedCarts: jest.fn(),
    };

    useCase = new ProcessWebhookUseCase(
      webhookRepository,
      orderRepository,
      userRepository,
      cartRepository,
    );
  });

  const setupApprovedPayment = (orderId: string, userId: string) => {
    webhookRepository.findNotificationById.mockResolvedValue(null);
    webhookRepository.saveNotification.mockResolvedValue(undefined);
    webhookRepository.getPaymentDetails.mockResolvedValue({
      id: 'payment-456',
      status: 'approved',
      status_detail: 'accredited',
      external_reference: orderId,
      transaction_amount: 100,
      date_approved: new Date().toISOString(),
      date_created: new Date().toISOString(),
      date_last_updated: new Date().toISOString(),
    });
    webhookRepository.updatePaymentStatus.mockResolvedValue(undefined);
    orderRepository.findOrderByPaymentGatewayId.mockResolvedValue({
      id: orderId,
      userId,
      totalAmount: 100,
      paymentStatus: OrderStatus.PENDING,
      creditUsed: 0,
      creditRestored: false,
    } as any);
    orderRepository.updateOrderStatus.mockResolvedValue(undefined);
  };

  describe('APPROVED Payment - Cart Clearing', () => {
    it('GIVEN approved payment WHEN webhook processed THEN should clear user cart', async () => {
      // Arrange
      setupApprovedPayment('order-789', 'user-abc');
      cartRepository.clearByUserId.mockResolvedValue(undefined);

      // Act
      await useCase.execute(baseInput);

      // Assert
      expect(cartRepository.clearByUserId).toHaveBeenCalledWith('user-abc');
    });

    it('GIVEN approved payment WHEN cart clearing fails THEN should NOT break webhook processing', async () => {
      // Arrange
      setupApprovedPayment('order-789', 'user-abc');
      cartRepository.clearByUserId.mockRejectedValue(new Error('DB Error'));

      // Act
      const result = await useCase.execute(baseInput);

      // Assert - webhook should still succeed
      expect(result.processed).toBe(true);
      expect(cartRepository.clearByUserId).toHaveBeenCalledWith('user-abc');
    });
  });

  describe('NON-APPROVED Payment - No Cart Clearing', () => {
    it('GIVEN rejected payment WHEN webhook processed THEN should NOT clear cart', async () => {
      // Arrange
      webhookRepository.findNotificationById.mockResolvedValue(null);
      webhookRepository.saveNotification.mockResolvedValue(undefined);
      webhookRepository.getPaymentDetails.mockResolvedValue({
        id: 'payment-456',
        status: 'rejected',
        status_detail: 'cc_rejected_other_reason',
        external_reference: 'order-789',
        transaction_amount: 100,
        date_created: new Date().toISOString(),
        date_last_updated: new Date().toISOString(),
      });
      webhookRepository.updatePaymentStatus.mockResolvedValue(undefined);
      orderRepository.findOrderByPaymentGatewayId.mockResolvedValue({
        id: 'order-789',
        userId: 'user-abc',
        totalAmount: 100,
        paymentStatus: OrderStatus.PENDING,
        creditUsed: 0,
        creditRestored: false,
      } as any);
      orderRepository.updateOrderStatus.mockResolvedValue(undefined);

      // Act
      await useCase.execute(baseInput);

      // Assert
      expect(cartRepository.clearByUserId).not.toHaveBeenCalled();
    });

    it('GIVEN pending payment WHEN webhook processed THEN should NOT clear cart', async () => {
      // Arrange
      webhookRepository.findNotificationById.mockResolvedValue(null);
      webhookRepository.saveNotification.mockResolvedValue(undefined);
      webhookRepository.getPaymentDetails.mockResolvedValue({
        id: 'payment-456',
        status: 'pending',
        status_detail: 'pending_waiting_payment',
        external_reference: 'order-789',
        transaction_amount: 100,
        date_created: new Date().toISOString(),
        date_last_updated: new Date().toISOString(),
      });
      webhookRepository.updatePaymentStatus.mockResolvedValue(undefined);
      orderRepository.findOrderByPaymentGatewayId.mockResolvedValue({
        id: 'order-789',
        userId: 'user-abc',
        totalAmount: 100,
        paymentStatus: OrderStatus.PENDING,
        creditUsed: 0,
        creditRestored: false,
      } as any);
      orderRepository.updateOrderStatus.mockResolvedValue(undefined);

      // Act
      await useCase.execute(baseInput);

      // Assert
      expect(cartRepository.clearByUserId).not.toHaveBeenCalled();
    });
  });

  describe('Backward Compatibility - No Cart Repository', () => {
    it('GIVEN no cart repository WHEN approved payment THEN should still process successfully', async () => {
      // Arrange
      const useCaseWithoutCart = new ProcessWebhookUseCase(
        webhookRepository,
        orderRepository,
        userRepository,
        // no cartRepository
      );
      setupApprovedPayment('order-789', 'user-abc');

      // Act
      const result = await useCaseWithoutCart.execute(baseInput);

      // Assert
      expect(result.processed).toBe(true);
    });
  });
});
