import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Req,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateOrderApplication } from '@application/orders/create-order.application';
import { FindOrdersApplication } from '@application/orders/find-orders.application';
import { FindOrderByIdApplication } from '@application/orders/find-order-by-id.application';
import {
  CreateOrderDto,
  CreateOrderResponseDto,
} from '../dto/create-order.dto';
import { OrderDto } from '../dto/order-response.dto';
import { OrderListResponseDto } from '../dto/order-list-response.dto';
import { ListOrdersQueryDto } from '../dto/list-orders-query.dto';
import { OrderAdapter } from '@application/orders/adapters/order.adapter';

@ApiTags('orders')
@Controller('v1/orders')
// @ApiBearerAuth()
// @UseGuards(JwtCustomAuthGuard)
export class OrdersController {
  constructor(
    private readonly createOrderApp: CreateOrderApplication,
    private readonly findOrdersApp: FindOrdersApplication,
    private readonly findOrderByIdApp: FindOrderByIdApplication,
  ) {}

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
    const userId = req.user.userId; // Obtido do JWT payload (payload.sub)
    const orderInput = OrderAdapter.toCreateOrderInput(dto, userId);
    const result = await this.createOrderApp.execute(orderInput);
    return OrderAdapter.toCreateOrderResponseDto(result);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar pedidos com paginação e filtros',
    description:
      'Retorna uma lista paginada de todos os pedidos para o painel de administração',
  })
  @ApiQuery({ type: ListOrdersQueryDto })
  @ApiResponse({
    status: 200,
    type: OrderListResponseDto,
    description: 'Lista de pedidos recuperada com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  @HttpCode(HttpStatus.OK)
  async findOrders(
    @Query() query: ListOrdersQueryDto,
  ): Promise<OrderListResponseDto> {
    return await this.findOrdersApp.execute(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar pedido por ID',
    description: 'Retorna os detalhes de um pedido específico pelo seu ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do pedido',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    type: OrderDto,
    description: 'Detalhes do pedido recuperados com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido não encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  @HttpCode(HttpStatus.OK)
  async findOrderById(@Param('id') id: string): Promise<OrderDto> {
    const order = await this.findOrderByIdApp.execute(id);

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }
}
