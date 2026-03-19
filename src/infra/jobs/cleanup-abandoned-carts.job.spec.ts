import { CleanupAbandonedCartsJob } from './cleanup-abandoned-carts.job';
import { CartRepositoryInterface } from '@core/cart/repositories/cart.repository.interface';

describe('CleanupAbandonedCartsJob', () => {
  let job: CleanupAbandonedCartsJob;
  let cartRepository: jest.Mocked<CartRepositoryInterface>;

  beforeEach(() => {
    cartRepository = {
      deleteAbandonedCarts: jest.fn(),
    } as any;

    job = new CleanupAbandonedCartsJob(cartRepository);
  });

  describe('execute', () => {
    it('GIVEN abandoned carts exist WHEN executing THEN should delete them and return count', async () => {
      // Arrange
      cartRepository.deleteAbandonedCarts.mockResolvedValue(5);

      // Act
      const result = await job.execute();

      // Assert
      expect(result).toEqual({ deletedCount: 5 });
      expect(cartRepository.deleteAbandonedCarts).toHaveBeenCalledWith(7);
    });

    it('GIVEN no abandoned carts WHEN executing THEN should return zero count', async () => {
      // Arrange
      cartRepository.deleteAbandonedCarts.mockResolvedValue(0);

      // Act
      const result = await job.execute();

      // Assert
      expect(result).toEqual({ deletedCount: 0 });
    });

    it('GIVEN repository error WHEN executing THEN should throw error', async () => {
      // Arrange
      cartRepository.deleteAbandonedCarts.mockRejectedValue(
        new Error('Connection timeout'),
      );

      // Act & Assert
      await expect(job.execute()).rejects.toThrow('Connection timeout');
    });
  });
});
