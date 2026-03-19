import { NotFoundException } from '@nestjs/common';
import { CartController } from './cart.controller';
import { GetCartApplication } from '@application/cart/get-cart.application';
import { UpdateCartApplication } from '@application/cart/update-cart.application';
import { ClearCartApplication } from '@application/cart/clear-cart.application';

describe('CartController', () => {
  let controller: CartController;
  let getCartApp: jest.Mocked<GetCartApplication>;
  let updateCartApp: jest.Mocked<UpdateCartApplication>;
  let clearCartApp: jest.Mocked<ClearCartApplication>;

  const mockReq = { user: { userId: 'user-123' } };

  beforeEach(() => {
    getCartApp = {
      execute: jest.fn(),
    } as any;

    updateCartApp = {
      execute: jest.fn(),
    } as any;

    clearCartApp = {
      execute: jest.fn(),
    } as any;

    controller = new CartController(getCartApp, updateCartApp, clearCartApp);
  });

  describe('GET /v1/cart', () => {
    it('GIVEN authenticated user WHEN getCart THEN should return cart items', async () => {
      // Arrange
      const items = [{ productId: 'p-1', quantity: 2 }];
      getCartApp.execute.mockResolvedValue(items);

      // Act
      const result = await controller.getCart(mockReq);

      // Assert
      expect(result).toEqual({ items });
      expect(getCartApp.execute).toHaveBeenCalledWith('user-123');
    });

    it('GIVEN new user WHEN getCart THEN should return empty items', async () => {
      // Arrange
      getCartApp.execute.mockResolvedValue([]);

      // Act
      const result = await controller.getCart(mockReq);

      // Assert
      expect(result).toEqual({ items: [] });
    });

    it('GIVEN no userId in token WHEN getCart THEN should throw NotFoundException', async () => {
      // Act & Assert
      await expect(controller.getCart({ user: {} })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('GIVEN userId from sub WHEN getCart THEN should extract userId from sub', async () => {
      // Arrange
      getCartApp.execute.mockResolvedValue([]);

      // Act
      await controller.getCart({ user: { sub: 'user-from-sub' } });

      // Assert
      expect(getCartApp.execute).toHaveBeenCalledWith('user-from-sub');
    });
  });

  describe('PUT /v1/cart', () => {
    it('GIVEN valid items WHEN updateCart THEN should return updated items', async () => {
      // Arrange
      const items = [{ productId: 'p-1', quantity: 3 }];
      updateCartApp.execute.mockResolvedValue(items);

      // Act
      const result = await controller.updateCart({ items }, mockReq);

      // Assert
      expect(result).toEqual({ items });
      expect(updateCartApp.execute).toHaveBeenCalledWith('user-123', items);
    });

    it('GIVEN empty items array WHEN updateCart THEN should accept it', async () => {
      // Arrange
      updateCartApp.execute.mockResolvedValue([]);

      // Act
      const result = await controller.updateCart({ items: [] }, mockReq);

      // Assert
      expect(result).toEqual({ items: [] });
      expect(updateCartApp.execute).toHaveBeenCalledWith('user-123', []);
    });

    it('GIVEN no userId in token WHEN updateCart THEN should throw NotFoundException', async () => {
      // Act & Assert
      await expect(
        controller.updateCart({ items: [] }, { user: {} }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('DELETE /v1/cart', () => {
    it('GIVEN authenticated user WHEN clearCart THEN should clear and return void', async () => {
      // Arrange
      clearCartApp.execute.mockResolvedValue(undefined);

      // Act
      await controller.clearCart(mockReq);

      // Assert
      expect(clearCartApp.execute).toHaveBeenCalledWith('user-123');
    });

    it('GIVEN no userId in token WHEN clearCart THEN should throw NotFoundException', async () => {
      // Act & Assert
      await expect(controller.clearCart({ user: {} })).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
