import { Injectable, Inject } from '@nestjs/common';
import { CartRepositoryInterface } from './repositories/cart.repository.interface';

@Injectable()
export class UpdateCartUseCase {
  constructor(
    @Inject('CartRepositoryInterface')
    private readonly cartRepository: CartRepositoryInterface,
  ) {}

  async execute(userId: string, items: any[]): Promise<any[]> {
    return await this.cartRepository.upsert(userId, items);
  }
}
