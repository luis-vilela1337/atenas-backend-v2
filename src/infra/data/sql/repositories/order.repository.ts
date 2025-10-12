import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderRepositoryInterface } from '@core/orders/repositories/order.repository.interface';
import {
  Order as OrderEntity,
  OrderStatus,
} from '@core/orders/entities/order.entity';
import {
  FindOrdersInput,
  FindOrdersResult,
} from '@core/orders/dto/find-orders.dto';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { OrderItemDetail } from '../entities/order-item-detail.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class OrderRepository implements OrderRepositoryInterface {
  private readonly logger = new Logger(OrderRepository.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(OrderItemDetail)
    private readonly orderItemDetailRepo: Repository<OrderItemDetail>,
  ) {}

  async createOrder(orderData: OrderEntity): Promise<OrderEntity> {
    this.logger.log(`Creating order for user: ${orderData.userId}`);

    try {
      // Create order entity
      const order = this.orderRepo.create({
        id: randomUUID(),
        userId: orderData.userId,
        totalAmount: orderData.totalAmount,
        paymentStatus: orderData.paymentStatus,
        paymentGatewayId: orderData.paymentGatewayId,
        contractNumber: orderData.contractNumber,
        contractUniqueId: orderData.contractUniqueId,
        shippingAddress: orderData.shippingAddress,
      });

      const savedOrder = await this.orderRepo.save(order);

      // Create order items and details
      const createdItems = [];
      for (const itemData of orderData.items) {
        const orderItem = this.orderItemRepo.create({
          id: randomUUID(),
          orderId: savedOrder.id,
          productId: itemData.productId,
          productName: itemData.productName,
          productType: itemData.productType,
          itemPrice: itemData.itemPrice,
        });

        const savedItem = await this.orderItemRepo.save(orderItem);

        // Create item details
        const createdDetails = [];
        for (const detailData of itemData.details) {
          const detail = this.orderItemDetailRepo.create({
            id: randomUUID(),
            orderItemId: savedItem.id,
            photoId: detailData.photoId,
            eventId: detailData.eventId,
            isPackage: detailData.isPackage,
          });

          const savedDetail = await this.orderItemDetailRepo.save(detail);
          createdDetails.push({
            id: savedDetail.id,
            photoId: savedDetail.photoId,
            eventId: savedDetail.eventId,
            isPackage: savedDetail.isPackage,
          });
        }

        createdItems.push({
          id: savedItem.id,
          productId: savedItem.productId,
          productName: savedItem.productName,
          productType: savedItem.productType,
          itemPrice: savedItem.itemPrice,
          details: createdDetails,
        });
      }

      return {
        id: savedOrder.id,
        displayId: savedOrder.displayId,
        userId: savedOrder.userId,
        totalAmount: savedOrder.totalAmount,
        paymentStatus: savedOrder.paymentStatus,
        paymentGatewayId: savedOrder.paymentGatewayId,
        contractNumber: savedOrder.contractNumber,
        contractUniqueId: savedOrder.contractUniqueId,
        shippingAddress: savedOrder.shippingAddress,
        items: createdItems,
        createdAt: savedOrder.createdAt,
        updatedAt: savedOrder.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Error creating order: ${error.message}`);
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  async findOrderById(id: string): Promise<OrderEntity | null> {
    this.logger.log(`Finding order by ID: ${id}`);

    try {
      const order = await this.orderRepo
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.items', 'items')
        .leftJoinAndSelect('items.details', 'details')
        .leftJoinAndSelect('details.photo', 'photo')
        .withDeleted()
        .where('order.id = :id', { id })
        .getOne();

      if (!order) {
        return null;
      }

      return this.mapToEntity(order);
    } catch (error) {
      this.logger.error(`Error finding order by ID: ${error.message}`);
      throw new Error(`Failed to find order: ${error.message}`);
    }
  }

  async findOrderByPaymentGatewayId(
    paymentGatewayId: string,
  ): Promise<OrderEntity | null> {
    this.logger.log(`Finding order by payment gateway ID: ${paymentGatewayId}`);

    try {
      const order = await this.orderRepo
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.items', 'items')
        .leftJoinAndSelect('items.details', 'details')
        .leftJoinAndSelect('details.photo', 'photo')
        .withDeleted()
        .where('order.paymentGatewayId = :paymentGatewayId', { paymentGatewayId })
        .getOne();

      if (!order) {
        return null;
      }

      return this.mapToEntity(order);
    } catch (error) {
      this.logger.error(
        `Error finding order by payment gateway ID: ${error.message}`,
      );
      throw new Error(`Failed to find order: ${error.message}`);
    }
  }

  async findOrdersByUserId(userId: string): Promise<OrderEntity[]> {
    this.logger.log(`Finding orders for user: ${userId}`);

    try {
      const orders = await this.orderRepo
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.items', 'items')
        .leftJoinAndSelect('items.details', 'details')
        .leftJoinAndSelect('details.photo', 'photo')
        .withDeleted()
        .where('order.userId = :userId', { userId })
        .orderBy('order.createdAt', 'DESC')
        .getMany();

      return orders.map((order) => this.mapToEntity(order));
    } catch (error) {
      this.logger.error(`Error finding orders by user ID: ${error.message}`);
      throw new Error(`Failed to find orders: ${error.message}`);
    }
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    this.logger.log(`Updating order ${orderId} status to: ${status}`);

    try {
      await this.orderRepo.update(orderId, {
        paymentStatus: status,
        updatedAt: new Date(),
      });
    } catch (error) {
      this.logger.error(`Error updating order status: ${error.message}`);
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  }

  async updateOrderPaymentGatewayId(
    orderId: string,
    paymentGatewayId: string,
  ): Promise<void> {
    this.logger.log(
      `Updating order ${orderId} payment gateway ID to: ${paymentGatewayId}`,
    );

    try {
      await this.orderRepo.update(orderId, {
        paymentGatewayId,
        updatedAt: new Date(),
      });
    } catch (error) {
      this.logger.error(`Error updating payment gateway ID: ${error.message}`);
      throw new Error(`Failed to update payment gateway ID: ${error.message}`);
    }
  }

  async findOrdersWithPagination(
    input: FindOrdersInput,
  ): Promise<FindOrdersResult> {
    this.logger.log(`Finding orders with pagination: ${JSON.stringify(input)}`);

    try {
      const { filter, pagination } = input;
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      const queryBuilder = this.orderRepo
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.items', 'items')
        .leftJoinAndSelect('items.details', 'details')
        .leftJoinAndSelect('details.photo', 'photo')
        .withDeleted()
        .orderBy('order.createdAt', 'DESC');

      if (filter?.userId) {
        queryBuilder.andWhere('order.userId = :userId', {
          userId: filter.userId,
        });
      }

      if (filter?.paymentStatus) {
        queryBuilder.andWhere('order.paymentStatus = :paymentStatus', {
          paymentStatus: filter.paymentStatus,
        });
      }

      const [orders, totalItems] = await queryBuilder
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      const totalPages = Math.ceil(totalItems / limit);
      const itemCount = orders.length;

      return {
        orders: orders.map((order) => this.mapToEntity(order)),
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        itemCount,
      };
    } catch (error) {
      this.logger.error(
        `Error finding orders with pagination: ${error.message}`,
      );
      throw new Error(`Failed to find orders: ${error.message}`);
    }
  }

  private mapToEntity(order: Order): OrderEntity {
    return {
      id: order.id,
      displayId: order.displayId,
      userId: order.userId,
      totalAmount: Number(order.totalAmount),
      paymentStatus: order.paymentStatus,
      paymentGatewayId: order.paymentGatewayId,
      contractNumber: order.contractNumber,
      contractUniqueId: order.contractUniqueId,
      shippingAddress: order.shippingAddress,
      items:
        order.items?.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          productType: item.productType,
          itemPrice: Number(item.itemPrice),
          details:
            item.details?.map((detail) => ({
              id: detail.id,
              photoId: detail.photoId,
              photoFileName: detail.photo?.fileName,
              eventId: detail.eventId,
              isPackage: detail.isPackage,
            })) || [],
        })) || [],
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
