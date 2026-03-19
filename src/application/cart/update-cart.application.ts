import { Injectable, Logger } from '@nestjs/common';
import { UpdateCartUseCase } from '@core/cart/update-cart.usecase';

@Injectable()
export class UpdateCartApplication {
  private readonly logger = new Logger(UpdateCartApplication.name);

  constructor(private readonly updateCartUseCase: UpdateCartUseCase) {}

  async execute(userId: string, items: any[]): Promise<any[]> {
    this.logger.log(`Updating cart for user: ${userId}`);
    return await this.updateCartUseCase.execute(userId, items);
  }
}
