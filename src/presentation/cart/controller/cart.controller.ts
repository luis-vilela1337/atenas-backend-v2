import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GetCartApplication } from '@application/cart/get-cart.application';
import { UpdateCartApplication } from '@application/cart/update-cart.application';
import { ClearCartApplication } from '@application/cart/clear-cart.application';
import { UpdateCartDto, CartResponseDto } from '../dto/cart.dto';
import { JwtCustomAuthGuard } from '@presentation/auth/guards/jwt-auth.guard';

@ApiTags('cart')
@Controller('v1/cart')
@ApiBearerAuth()
@UseGuards(JwtCustomAuthGuard)
export class CartController {
  constructor(
    private readonly getCartApp: GetCartApplication,
    private readonly updateCartApp: UpdateCartApplication,
    private readonly clearCartApp: ClearCartApplication,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Retornar o carrinho do usuário autenticado',
    description:
      'Retorna os itens do carrinho do usuário. Se não existir carrinho, retorna { items: [] }.',
  })
  @ApiResponse({
    status: 200,
    type: CartResponseDto,
    description: 'Carrinho retornado com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  @HttpCode(HttpStatus.OK)
  async getCart(@Request() req: any): Promise<CartResponseDto> {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) {
      throw new NotFoundException('User ID not found in token');
    }

    const items = await this.getCartApp.execute(userId);
    return { items };
  }

  @Put()
  @ApiOperation({
    summary: 'Criar ou atualizar o carrinho do usuário (upsert)',
    description:
      'Substitui todos os itens do carrinho do usuário. Cria o carrinho se não existir.',
  })
  @ApiBody({ type: UpdateCartDto })
  @ApiResponse({
    status: 200,
    type: CartResponseDto,
    description: 'Carrinho atualizado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  @HttpCode(HttpStatus.OK)
  async updateCart(
    @Body() dto: UpdateCartDto,
    @Request() req: any,
  ): Promise<CartResponseDto> {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) {
      throw new NotFoundException('User ID not found in token');
    }

    const items = await this.updateCartApp.execute(userId, dto.items);
    return { items };
  }

  @Delete()
  @ApiOperation({
    summary: 'Limpar o carrinho do usuário',
    description:
      'Remove todos os itens do carrinho. Idempotente — retorna 204 mesmo se não existir carrinho.',
  })
  @ApiResponse({
    status: 204,
    description: 'Carrinho limpo com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCart(@Request() req: any): Promise<void> {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) {
      throw new NotFoundException('User ID not found in token');
    }

    await this.clearCartApp.execute(userId);
  }
}
