import { ClearCartUseCase } from './clear-cart.usecase';
import { CartRepositoryInterface } from './repositories/cart.repository.interface';

describe('ClearCartUseCase', () => {
  let useCase: ClearCartUseCase;
  let cartRepository: jest.Mocked<CartRepositoryInterface>;

  beforeEach(() => {
    cartRepository = {
      findByUserId: jest.fn(),
      upsert: jest.fn(),
      clearByUserId: jest.fn(),
      deleteAbandonedCarts: jest.fn(),
    };

    useCase = new ClearCartUseCase(cartRepository);
  });

  describe('execute', () => {
    it('GIVEN existing cart WHEN executing THEN should call clearByUserId', async () => {
      // Arrange
      cartRepository.clearByUserId.mockResolvedValue(undefined);

      // Act
      await useCase.execute('user-123');

      // Assert
      expect(cartRepository.clearByUserId).toHaveBeenCalledWith('user-123');
      expect(cartRepository.clearByUserId).toHaveBeenCalledTimes(1);
    });

    it('GIVEN no cart exists WHEN executing THEN should still call clearByUserId without error', async () => {
      // Arrange
      cartRepository.clearByUserId.mockResolvedValue(undefined);

      // Act & Assert
      await expect(useCase.execute('user-456')).resolves.not.toThrow();
      expect(cartRepository.clearByUserId).toHaveBeenCalledWith('user-456');
    });
  });
});
