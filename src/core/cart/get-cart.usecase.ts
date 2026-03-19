import { Injectable, Inject } from '@nestjs/common';
import { CartRepositoryInterface } from './repositories/cart.repository.interface';

@Injectable()
export class GetCartUseCase {
  constructor(
    @Inject('CartRepositoryInterface')
    private readonly cartRepository: CartRepositoryInterface,
  ) {}

  async execute(userId: string): Promise<any[]> {
    const items = await this.cartRepository.findByUserId(userId);
    return items ?? [];
  }
}
