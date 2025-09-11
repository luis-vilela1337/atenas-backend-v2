import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Param,
  Query,
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
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateOrderApplication } from '@application/orders/create-order.application';
import { FindOrdersApplication } from '@application/orders/find-orders.application';
import { FindOrderByIdApplication } from '@application/orders/find-order-by-id.application';
import { UpdateOrderStatusApplication } from '@application/orders/update-order-status.application';
import {
  CreateOrderDto,
  CreateOrderResponseDto,
} from '../dto/create-order.dto';
import { OrderDto } from '../dto/order-response.dto';
import { OrderListResponseDto } from '../dto/order-list-response.dto';
import { ListOrdersQueryDto } from '../dto/list-orders-query.dto';
import {
  UpdateOrderStatusDto,
  UpdateOrderStatusResponseDto,
} from '../dto/update-order-status.dto';
import { OrderAdapter } from '@application/orders/adapters/order.adapter';
import { JwtCustomAuthGuard } from '@presentation/auth/guards/jwt-auth.guard';

@ApiTags('orders')
@Controller('v1/orders')
@ApiBearerAuth()
@UseGuards(JwtCustomAuthGuard)
export class OrdersController {
  constructor(
    private readonly createOrderApp: CreateOrderApplication,
    private readonly findOrdersApp: FindOrdersApplication,
    private readonly findOrderByIdApp: FindOrderByIdApplication,
    private readonly updateOrderStatusApp: UpdateOrderStatusApplication,
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
    @Request() req: any,
  ): Promise<CreateOrderResponseDto> {
    const userId = req.user?.userId || req.user?.sub; // Obtido do JWT payload
    if (!userId) {
      throw new NotFoundException('User ID not found in token');
    }
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

  @Put(':id/status')
  @ApiOperation({
    summary: 'Atualizar status do pedido',
    description: 'Atualiza o status de um pedido específico pelo seu ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do pedido',
    type: 'string',
  })
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiResponse({
    status: 200,
    type: UpdateOrderStatusResponseDto,
    description: 'Status do pedido atualizado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou transição de status inválida',
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
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<UpdateOrderStatusResponseDto> {
    return await this.updateOrderStatusApp.execute({
      orderId: id,
      status: dto.status,
    });
  }
}
