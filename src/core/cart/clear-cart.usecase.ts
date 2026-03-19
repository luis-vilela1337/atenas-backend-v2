import { Injectable, Inject, Logger } from '@nestjs/common';
import { CartRepositoryInterface } from './repositories/cart.repository.interface';

@Injectable()
export class ClearCartUseCase {
  private readonly logger = new Logger(ClearCartUseCase.name);

  constructor(
    @Inject('CartRepositoryInterface')
    private readonly cartRepository: CartRepositoryInterface,
  ) {}

  async execute(userId: string): Promise<void> {
    this.logger.log(`Clearing cart for user: ${userId}`);
    await this.cartRepository.clearByUserId(userId);
  }
}
