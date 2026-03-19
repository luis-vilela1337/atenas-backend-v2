import { Injectable, Logger } from '@nestjs/common';
import { GetCartUseCase } from '@core/cart/get-cart.usecase';

@Injectable()
export class GetCartApplication {
  private readonly logger = new Logger(GetCartApplication.name);

  constructor(private readonly getCartUseCase: GetCartUseCase) {}

  async execute(userId: string): Promise<any[]> {
    this.logger.log(`Getting cart for user: ${userId}`);
    return await this.getCartUseCase.execute(userId);
  }
}
