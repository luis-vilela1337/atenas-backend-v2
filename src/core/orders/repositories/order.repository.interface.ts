import { Order, OrderStatus } from '../entities/order.entity';
import { FindOrdersInput, FindOrdersResult } from '../dto/find-orders.dto';

export interface OrderRepositoryInterface {
  createOrder(order: Order): Promise<Order>;
  findOrderById(id: string): Promise<Order | null>;
  findOrderByPaymentGatewayId(paymentGatewayId: string): Promise<Order | null>;
  findOrdersByUserId(userId: string): Promise<Order[]>;
  findOrdersWithPagination(input: FindOrdersInput): Promise<FindOrdersResult>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
  updateOrderPaymentGatewayId(
    orderId: string,
    paymentGatewayId: string,
  ): Promise<void>;
}
