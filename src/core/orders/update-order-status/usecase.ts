import { UpdateOrderStatusInput } from '../entities/order.entity';
import { OrderRepositoryInterface } from '../repositories/order.repository.interface';

export class UpdateOrderStatusUseCase {
  constructor(private readonly orderRepository: OrderRepositoryInterface) {}

  async execute(input: UpdateOrderStatusInput): Promise<void> {
    try {
      // 1. Check if order exists
      const order = await this.orderRepository.findOrderById(input.orderId);
      if (!order) {
        throw new Error(`Order with ID ${input.orderId} not found`);
      }

      // 2. Validate status transition
      this.validateStatusTransition(order.paymentStatus, input.paymentStatus);

      // 3. Update order status
      await this.orderRepository.updateOrderStatus(
        input.orderId,
        input.paymentStatus,
      );

      // 4. Update payment gateway ID if provided
      if (input.paymentGatewayId) {
        await this.orderRepository.updateOrderPaymentGatewayId(
          input.orderId,
          input.paymentGatewayId,
        );
      }
    } catch (error) {
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  }

  private validateStatusTransition(
    currentStatus: string,
    newStatus: string,
  ): void {
    const validTransitions = {
      PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
      APPROVED: ['CANCELLED'], // Can cancel even approved orders
      REJECTED: [], // Final state
      CANCELLED: [], // Final state
    };

    const allowedTransitions = validTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}
