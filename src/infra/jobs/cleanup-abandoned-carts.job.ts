import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CartRepositoryInterface } from '@core/cart/repositories/cart.repository.interface';

@Injectable()
export class CleanupAbandonedCartsJob {
  private readonly logger = new Logger(CleanupAbandonedCartsJob.name);
  private readonly DAYS_THRESHOLD = 7;

  constructor(
    @Inject('CartRepositoryInterface')
    private readonly cartRepository: CartRepositoryInterface,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async executeScheduled(): Promise<void> {
    await this.execute();
  }

  async execute(): Promise<{ deletedCount: number }> {
    this.logger.log(
      `Running cleanup abandoned carts job (threshold: ${this.DAYS_THRESHOLD} days)`,
    );

    try {
      const deletedCount = await this.cartRepository.deleteAbandonedCarts(
        this.DAYS_THRESHOLD,
      );

      this.logger.log(
        `Cleanup abandoned carts job completed: ${deletedCount} carts deleted`,
      );

      return { deletedCount };
    } catch (error) {
      this.logger.error(
        `Error running cleanup abandoned carts job: ${error.message}`,
      );
      throw error;
    }
  }
}
