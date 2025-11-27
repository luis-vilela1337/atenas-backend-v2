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
          quantity: itemData.quantity,
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
          quantity: savedItem.quantity,
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
        .withDeleted()
        .where('order.id = :id', { id })
        .getOne();

      if (!order) {
        return null;
      }

      // Collect all photoIds and eventIds
      const photoIds = new Set<string>();
      const eventIds = new Set<string>();
      order.items?.forEach((item) => {
        item.details?.forEach((detail) => {
          if (detail.photoId) {
            photoIds.add(detail.photoId);
          }
          if (detail.eventId) {
            eventIds.add(detail.eventId);
          }
        });
      });

      // Load photos separately (including soft-deleted)
      const photoMap = new Map<string, any>();
      if (photoIds.size > 0) {
        this.logger.debug(
          `Loading ${photoIds.size} photos with IDs: ${Array.from(photoIds)
            .slice(0, 3)
            .join(', ')}...`,
        );

        // Use direct SQL query to bypass TypeORM filters
        const photoIdsArray = Array.from(photoIds);
        const placeholders = photoIdsArray
          .map((_, index) => `$${index + 1}`)
          .join(', ');

        const photos = await this.orderRepo.manager.query(
          `SELECT id, "fileName" FROM user_event_photos WHERE id IN (${placeholders})`,
          photoIdsArray,
        );

        this.logger.debug(
          `Photos query returned ${photos.length} results from ${photoIdsArray.length} IDs`,
        );

        photos.forEach((photo) => {
          photoMap.set(photo.id, photo);
        });
      }

      // Load events separately (including soft-deleted)
      const eventMap = new Map<string, any>();
      if (eventIds.size > 0) {
        this.logger.debug(
          `Loading ${eventIds.size} events with IDs: ${Array.from(eventIds)
            .slice(0, 3)
            .join(', ')}...`,
        );

        const eventIdsArray = Array.from(eventIds);
        const placeholders = eventIdsArray
          .map((_, index) => `$${index + 1}`)
          .join(', ');

        const events = await this.orderRepo.manager.query(
          `SELECT id, name FROM institution_events WHERE id IN (${placeholders})`,
          eventIdsArray,
        );

        this.logger.debug(
          `Events query returned ${events.length} results from ${eventIdsArray.length} IDs`,
        );

        events.forEach((event) => {
          eventMap.set(event.id, event);
        });
      }

      // Map photos and events to details
      order.items?.forEach((item) => {
        item.details?.forEach((detail) => {
          if (detail.photoId && photoMap.has(detail.photoId)) {
            (detail as any).photo = photoMap.get(detail.photoId);
          }
          if (detail.eventId && eventMap.has(detail.eventId)) {
            (detail as any).event = eventMap.get(detail.eventId);
          }
        });
      });

      // Debug log
      this.logger.debug(
        `Order found with ${photoMap.size} photos and ${
          eventMap.size
        } events loaded: ${JSON.stringify({
          id: order.id,
          itemsCount: order.items?.length || 0,
          firstItem: order.items?.[0]
            ? {
                id: order.items[0].id,
                detailsCount: order.items[0].details?.length || 0,
                firstDetail: order.items[0].details?.[0],
              }
            : null,
        })}`,
      );

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
        .leftJoin('user_event_photos', 'photo', 'photo.id = details.photoId')
        .addSelect([
          'photo.id',
          'photo.fileName',
          'photo.createdAt',
          'photo.updatedAt',
          'photo.deletedAt',
        ])
        .withDeleted()
        .where('order.paymentGatewayId = :paymentGatewayId', {
          paymentGatewayId,
        })
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
        .leftJoin('user_event_photos', 'photo', 'photo.id = details.photoId')
        .addSelect([
          'photo.id',
          'photo.fileName',
          'photo.createdAt',
          'photo.updatedAt',
          'photo.deletedAt',
        ])
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
        .leftJoin('user_event_photos', 'photo', 'photo.id = details.photoId')
        .addSelect([
          'photo.id',
          'photo.fileName',
          'photo.createdAt',
          'photo.updatedAt',
          'photo.deletedAt',
        ])
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

      // Debug log
      this.logger.debug(
        `Orders found: ${orders.length}, First order details: ${JSON.stringify({
          id: orders[0]?.id,
          itemsCount: orders[0]?.items?.length || 0,
          items: orders[0]?.items?.map((item) => ({
            id: item.id,
            detailsCount: item.details?.length || 0,
          })),
        })}`,
      );

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
          quantity: item.quantity,
          details:
            item.details?.map((detail) => ({
              id: detail.id,
              photoId: detail.photoId,
              photoFileName: detail.photo?.fileName,
              eventId: detail.eventId,
              eventName: (detail as any).event?.name,
              isPackage: detail.isPackage,
            })) || [],
        })) || [],
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
