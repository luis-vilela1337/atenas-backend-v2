import { Injectable, Logger } from '@nestjs/common';
import { ClearCartUseCase } from '@core/cart/clear-cart.usecase';

@Injectable()
export class ClearCartApplication {
  private readonly logger = new Logger(ClearCartApplication.name);

  constructor(private readonly clearCartUseCase: ClearCartUseCase) {}

  async execute(userId: string): Promise<void> {
    this.logger.log(`Clearing cart for user: ${userId}`);
    await this.clearCartUseCase.execute(userId);
  }
}
