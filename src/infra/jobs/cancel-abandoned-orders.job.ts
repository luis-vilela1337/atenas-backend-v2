import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderRepository } from '../data/sql/repositories/order.repository';
import { UserSQLRepository } from '../data/sql/repositories/user.repository';
import { OrderStatus } from '@core/orders/entities/order.entity';

@Injectable()
export class CancelAbandonedOrdersJob {
  private readonly logger = new Logger(CancelAbandonedOrdersJob.name);
  private readonly HOURS_THRESHOLD = 24;

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly userRepository: UserSQLRepository,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async execute(): Promise<void> {
    this.logger.log(
      `Running cancel abandoned orders job (threshold: ${this.HOURS_THRESHOLD}h)`,
    );

    try {
      const abandonedOrders = await this.orderRepository.findAbandonedOrders(
        this.HOURS_THRESHOLD,
      );

      this.logger.log(`Found ${abandonedOrders.length} abandoned orders`);

      for (const order of abandonedOrders) {
        try {
          await this.orderRepository.updateOrderStatus(
            order.id,
            OrderStatus.CANCELLED,
          );

          if (order.creditUsed && order.creditUsed > 0 && !order.creditRestored) {
            await this.userRepository.addCredit(order.userId, order.creditUsed);
            await this.orderRepository.markCreditRestored(order.id);
            this.logger.log(
              `Restored ${order.creditUsed} credit to user ${order.userId} for abandoned order ${order.id}`,
            );
          }

          this.logger.log(`Cancelled abandoned order ${order.id}`);
        } catch (error) {
          this.logger.error(
            `Error processing abandoned order ${order.id}: ${error.message}`,
          );
        }
      }

      this.logger.log('Cancel abandoned orders job completed');
    } catch (error) {
      this.logger.error(
        `Error running cancel abandoned orders job: ${error.message}`,
      );
    }
  }
}
