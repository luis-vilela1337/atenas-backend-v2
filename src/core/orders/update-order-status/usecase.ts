import { Injectable } from '@nestjs/common';
import { UpdateOrderStatusInput, OrderStatus } from '../entities/order.entity';
import { OrderRepository } from '@infrastructure/data/sql/repositories/order.repository';

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

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
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): void {
    const validTransitions = {
      [OrderStatus.PENDING]: [
        OrderStatus.APPROVED,
        OrderStatus.REJECTED,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.APPROVED]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      [OrderStatus.REJECTED]: [], // Final state
      [OrderStatus.CANCELLED]: [], // Final state
      [OrderStatus.COMPLETED]: [], // Final state
    };

    const allowedTransitions = validTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}
