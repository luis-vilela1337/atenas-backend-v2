import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderRepository } from '../data/sql/repositories/order.repository';
import { UserSQLRepository } from '../data/sql/repositories/user.repository';
import { OrderStatus } from '@core/orders/entities/order.entity';

export interface CancelAbandonedOrdersResult {
  totalFound: number;
  cancelled: number;
  creditsRestored: number;
  errors: string[];
  details: {
    orderId: string;
    userId: string;
    creditRestored?: number;
    status: 'cancelled' | 'error';
    error?: string;
  }[];
}

@Injectable()
export class CancelAbandonedOrdersJob {
  private readonly logger = new Logger(CancelAbandonedOrdersJob.name);
  private readonly DEFAULT_HOURS_THRESHOLD = 24;

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly userRepository: UserSQLRepository,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async executeScheduled(): Promise<void> {
    await this.execute(this.DEFAULT_HOURS_THRESHOLD);
  }

  async execute(
    hoursThreshold: number = this.DEFAULT_HOURS_THRESHOLD,
  ): Promise<CancelAbandonedOrdersResult> {
    this.logger.log(
      `Running cancel abandoned orders job (threshold: ${hoursThreshold}h)`,
    );

    const result: CancelAbandonedOrdersResult = {
      totalFound: 0,
      cancelled: 0,
      creditsRestored: 0,
      errors: [],
      details: [],
    };

    try {
      const abandonedOrders = await this.orderRepository.findAbandonedOrders(
        hoursThreshold,
      );

      result.totalFound = abandonedOrders.length;
      this.logger.log(`Found ${abandonedOrders.length} abandoned orders`);

      for (const order of abandonedOrders) {
        try {
          await this.orderRepository.updateOrderStatus(
            order.id,
            OrderStatus.CANCELLED,
          );

          const detail: CancelAbandonedOrdersResult['details'][0] = {
            orderId: order.id,
            userId: order.userId,
            status: 'cancelled',
          };

          if (
            order.creditUsed &&
            order.creditUsed > 0 &&
            !order.creditRestored
          ) {
            await this.orderRepository.markCreditRestored(order.id);
            await this.userRepository.releaseReservedCredit(
              order.userId,
              order.creditUsed,
            );
            detail.creditRestored = order.creditUsed;
            result.creditsRestored++;
            this.logger.log(
              `Released ${order.creditUsed} reserved credit back to user ${order.userId} for abandoned order ${order.id}`,
            );
          }

          result.cancelled++;
          result.details.push(detail);
          this.logger.log(`Cancelled abandoned order ${order.id}`);
        } catch (error) {
          const errorMsg = `Error processing order ${order.id}: ${error.message}`;
          result.errors.push(errorMsg);
          result.details.push({
            orderId: order.id,
            userId: order.userId,
            status: 'error',
            error: error.message,
          });
          this.logger.error(errorMsg);
        }
      }

      this.logger.log(
        `Cancel abandoned orders job completed: ${result.cancelled}/${result.totalFound} cancelled, ${result.creditsRestored} credits restored`,
      );
    } catch (error) {
      const errorMsg = `Error running job: ${error.message}`;
      result.errors.push(errorMsg);
      this.logger.error(errorMsg);
    }

    return result;
  }
}
