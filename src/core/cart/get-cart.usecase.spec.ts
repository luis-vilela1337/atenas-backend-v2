import { GetCartUseCase } from './get-cart.usecase';
import { CartRepositoryInterface } from './repositories/cart.repository.interface';

describe('GetCartUseCase', () => {
  let useCase: GetCartUseCase;
  let cartRepository: jest.Mocked<CartRepositoryInterface>;

  beforeEach(() => {
    cartRepository = {
      findByUserId: jest.fn(),
      upsert: jest.fn(),
      clearByUserId: jest.fn(),
      deleteAbandonedCarts: jest.fn(),
    };

    useCase = new GetCartUseCase(cartRepository);
  });

  describe('execute', () => {
    it('GIVEN existing cart WHEN executing THEN should return items', async () => {
      // Arrange
      const items = [
        { productId: 'p-1', quantity: 2 },
        { productId: 'p-2', quantity: 1 },
      ];
      cartRepository.findByUserId.mockResolvedValue(items);

      // Act
      const result = await useCase.execute('user-123');

      // Assert
      expect(result).toEqual(items);
      expect(cartRepository.findByUserId).toHaveBeenCalledWith('user-123');
    });

    it('GIVEN no cart exists WHEN executing THEN should return empty array', async () => {
      // Arrange
      cartRepository.findByUserId.mockResolvedValue(null);

      // Act
      const result = await useCase.execute('user-123');

      // Assert
      expect(result).toEqual([]);
    });

    it('GIVEN empty cart WHEN executing THEN should return empty array', async () => {
      // Arrange
      cartRepository.findByUserId.mockResolvedValue([]);

      // Act
      const result = await useCase.execute('user-456');

      // Assert
      expect(result).toEqual([]);
    });
  });
});
