import { UpdateCartUseCase } from './update-cart.usecase';
import { CartRepositoryInterface } from './repositories/cart.repository.interface';

describe('UpdateCartUseCase', () => {
  let useCase: UpdateCartUseCase;
  let cartRepository: jest.Mocked<CartRepositoryInterface>;

  beforeEach(() => {
    cartRepository = {
      findByUserId: jest.fn(),
      upsert: jest.fn(),
      clearByUserId: jest.fn(),
      deleteAbandonedCarts: jest.fn(),
    };

    useCase = new UpdateCartUseCase(cartRepository);
  });

  describe('execute', () => {
    it('GIVEN new items WHEN executing THEN should upsert and return saved items', async () => {
      // Arrange
      const items = [{ productId: 'p-1', quantity: 3 }];
      cartRepository.upsert.mockResolvedValue(items);

      // Act
      const result = await useCase.execute('user-123', items);

      // Assert
      expect(result).toEqual(items);
      expect(cartRepository.upsert).toHaveBeenCalledWith('user-123', items);
    });

    it('GIVEN empty items array WHEN executing THEN should upsert with empty array', async () => {
      // Arrange
      cartRepository.upsert.mockResolvedValue([]);

      // Act
      const result = await useCase.execute('user-123', []);

      // Assert
      expect(result).toEqual([]);
      expect(cartRepository.upsert).toHaveBeenCalledWith('user-123', []);
    });

    it('GIVEN multiple items WHEN executing THEN should pass all items to repository', async () => {
      // Arrange
      const items = [
        { productId: 'p-1', quantity: 1 },
        { productId: 'p-2', quantity: 5 },
        { productId: 'p-3', quantity: 2 },
      ];
      cartRepository.upsert.mockResolvedValue(items);

      // Act
      const result = await useCase.execute('user-456', items);

      // Assert
      expect(result).toEqual(items);
      expect(cartRepository.upsert).toHaveBeenCalledWith('user-456', items);
    });
  });
});
