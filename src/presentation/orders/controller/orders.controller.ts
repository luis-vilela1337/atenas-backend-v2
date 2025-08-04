import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateOrderApplication } from '@application/orders/create-order.application';
import {
  CreateOrderDto,
  CreateOrderResponseDto,
} from '../dto/create-order.dto';
import { OrderAdapter } from '@application/orders/adapters/order.adapter';
import { JwtCustomAuthGuard } from '@presentation/auth/guards/jwt-auth.guard';

@ApiTags('orders')
@Controller('v1/orders')
@ApiBearerAuth()
@UseGuards(JwtCustomAuthGuard)
export class OrdersController {
  constructor(private readonly createOrderApp: CreateOrderApplication) {}

  @Post()
  @ApiOperation({
    summary: 'Criar novo pedido e gerar checkout do Mercado Pago',
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    type: CreateOrderResponseDto,
    description: 'Pedido criado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou erro na criação do pedido',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @Body() dto: CreateOrderDto,
    @Req() req: any,
  ): Promise<CreateOrderResponseDto> {
    const userId = req.user.id; // Obtido do JWT payload
    const orderInput = OrderAdapter.toCreateOrderInput(dto, userId);
    const result = await this.createOrderApp.execute(orderInput);
    return OrderAdapter.toCreateOrderResponseDto(result);
  }
}
