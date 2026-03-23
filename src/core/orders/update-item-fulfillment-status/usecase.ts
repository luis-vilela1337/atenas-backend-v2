import { Injectable } from '@nestjs/common';
import {
  FulfillmentStatus,
  FULFILLMENT_TRANSITIONS,
  OrderStatus,
} from '../entities/order.entity';
import { OrderRepository } from '@infrastructure/data/sql/repositories/order.repository';
import { UpdateOrderStatusUseCase } from '../update-order-status/usecase';

export interface UpdateItemFulfillmentStatusInput {
  orderId: string;
  orderItemId: string;
  fulfillmentStatus: FulfillmentStatus;
}

@Injectable()
export class UpdateItemFulfillmentStatusUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
  ) {}

  async execute(
    input: UpdateItemFulfillmentStatusInput,
  ): Promise<{ productType: string; completedAt?: Date }> {
    const order = await this.orderRepository.findOrderById(input.orderId);
    if (!order) {
      throw new Error(`Order with ID ${input.orderId} not found`);
    }

    if (
      order.paymentStatus !== 'APPROVED' &&
      order.paymentStatus !== 'COMPLETED'
    ) {
      throw new Error(
        `Cannot update fulfillment for order with payment status ${order.paymentStatus}. Order must be APPROVED or COMPLETED.`,
      );
    }

    const item = order.items.find((i) => i.id === input.orderItemId);
    if (!item) {
      throw new Error(
        `Item ${input.orderItemId} not found in order ${input.orderId}`,
      );
    }

    this.validateTransition(
      item.productType,
      item.fulfillmentStatus,
      input.fulfillmentStatus,
    );

    let completedAt: Date | undefined;
    if (
      input.fulfillmentStatus === FulfillmentStatus.DELIVERED ||
      input.fulfillmentStatus === FulfillmentStatus.SENT
    ) {
      completedAt = new Date();
    }

    await this.orderRepository.updateItemFulfillmentStatus(
      input.orderItemId,
      input.fulfillmentStatus,
      completedAt,
    );

    const updatedOrder = await this.orderRepository.findOrderById(
      input.orderId,
    );
    if (updatedOrder && updatedOrder.paymentStatus === OrderStatus.APPROVED) {
      const allCompleted = updatedOrder.items.every(
        (i) =>
          i.fulfillmentStatus === FulfillmentStatus.DELIVERED ||
          i.fulfillmentStatus === FulfillmentStatus.SENT,
      );

      if (allCompleted) {
        await this.updateOrderStatusUseCase.execute({
          orderId: input.orderId,
          paymentStatus: OrderStatus.COMPLETED,
        });
      }
    }

    return { productType: item.productType, completedAt };
  }

  private validateTransition(
    productType: string,
    currentStatus: FulfillmentStatus,
    newStatus: FulfillmentStatus,
  ): void {
    const typeTransitions = FULFILLMENT_TRANSITIONS[productType];
    if (!typeTransitions) {
      throw new Error(`Unknown product type: ${productType}`);
    }

    const allowed = typeTransitions[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new Error(
        `Invalid fulfillment transition for ${productType}: ${currentStatus} → ${newStatus}`,
      );
    }
  }
}
