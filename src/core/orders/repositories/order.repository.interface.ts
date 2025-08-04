import { Order } from '../entities/order.entity';

export interface OrderRepositoryInterface {
  createOrder(order: Order): Promise<Order>;
  findOrderById(id: string): Promise<Order | null>;
  findOrderByPaymentGatewayId(paymentGatewayId: string): Promise<Order | null>;
  findOrdersByUserId(userId: string): Promise<Order[]>;
  updateOrderStatus(
    orderId: string,
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED',
  ): Promise<void>;
  updateOrderPaymentGatewayId(
    orderId: string,
    paymentGatewayId: string,
  ): Promise<void>;
}
