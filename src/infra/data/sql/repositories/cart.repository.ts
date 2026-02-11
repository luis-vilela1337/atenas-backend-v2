import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartRepositoryInterface } from '@core/cart/repositories/cart.repository.interface';
import { Cart } from '../entities/cart.entity';

@Injectable()
export class CartSQLRepository implements CartRepositoryInterface {
  private readonly logger = new Logger(CartSQLRepository.name);

  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
  ) {}

  async findByUserId(userId: string): Promise<any[] | null> {
    this.logger.log(`Finding cart for user: ${userId}`);

    const cart = await this.cartRepo.findOne({ where: { userId } });

    if (!cart) {
      return null;
    }

    return cart.items;
  }

  async upsert(userId: string, items: any[]): Promise<any[]> {
    this.logger.log(`Upserting cart for user: ${userId}`);

    const existing = await this.cartRepo.findOne({ where: { userId } });

    if (existing) {
      existing.items = items;
      const saved = await this.cartRepo.save(existing);
      return saved.items;
    }

    const cart = this.cartRepo.create({ userId, items });
    const saved = await this.cartRepo.save(cart);
    return saved.items;
  }

  async clearByUserId(userId: string): Promise<void> {
    this.logger.log(`Clearing cart for user: ${userId}`);

    await this.cartRepo.delete({ userId });
  }

  async deleteAbandonedCarts(daysThreshold: number): Promise<number> {
    this.logger.log(
      `Deleting abandoned carts older than ${daysThreshold} days`,
    );

    const result = await this.cartRepo
      .createQueryBuilder()
      .delete()
      .from(Cart)
      .where('updated_at < NOW() - INTERVAL :interval', {
        interval: `${daysThreshold} days`,
      })
      .execute();

    const deletedCount = result.affected ?? 0;
    this.logger.log(`Deleted ${deletedCount} abandoned carts`);
    return deletedCount;
  }
}
