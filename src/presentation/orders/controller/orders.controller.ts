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
  BadRequestException,
  Inject,
  UseGuards,
  Request,
  SetMetadata,
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
import { UpdateItemFulfillmentStatusApplication } from '@application/orders/update-item-fulfillment-status.application';
import { CancelOrderByClientApplication } from '@application/orders/cancel-order-by-client.application';
import {
  CancelAbandonedOrdersJob,
  CancelAbandonedOrdersResult,
} from '@infrastructure/jobs/cancel-abandoned-orders.job';
import { UserSQLRepository } from '@infrastructure/data/sql/repositories/user.repository';
import { OrderRepositoryInterface } from '@core/orders/repositories/order.repository.interface';
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
import {
  UpdateFulfillmentStatusDto,
  UpdateFulfillmentStatusResponseDto,
} from '../dto/update-fulfillment-status.dto';
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
    private readonly updateItemFulfillmentStatusApp: UpdateItemFulfillmentStatusApplication,
    private readonly cancelOrderByClientApp: CancelOrderByClientApplication,
    private readonly cancelAbandonedOrdersJob: CancelAbandonedOrdersJob,
    private readonly userRepository: UserSQLRepository,
    @Inject('OrderRepositoryInterface')
    private readonly orderRepository: OrderRepositoryInterface,
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
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) {
      throw new NotFoundException('User ID not found in token');
    }
    const orderInput = OrderAdapter.toCreateOrderInput(dto, userId);
    const result = await this.createOrderApp.execute(orderInput);
    return OrderAdapter.toCreateOrderResponseDto(result);
  }

  @Get()
  @SetMetadata('isPublic', true)
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
      driveLink: dto.driveLink,
    });
  }

  @Put(':orderId/items/:itemId/fulfillment-status')
  @ApiOperation({
    summary: 'Atualizar status de fulfillment de um item do pedido',
    description:
      'Atualiza o status de fulfillment para cada item com base no tipo de produto',
  })
  @ApiParam({
    name: 'orderId',
    description: 'ID único do pedido',
    type: 'string',
  })
  @ApiParam({
    name: 'itemId',
    description: 'ID único do item do pedido',
    type: 'string',
  })
  @ApiBody({ type: UpdateFulfillmentStatusDto })
  @ApiResponse({
    status: 200,
    type: UpdateFulfillmentStatusResponseDto,
    description: 'Status de fulfillment atualizado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou transição de status inválida',
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido ou Item não encontrado',
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
  async updateItemFulfillmentStatus(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateFulfillmentStatusDto,
  ): Promise<UpdateFulfillmentStatusResponseDto> {
    return await this.updateItemFulfillmentStatusApp.execute({
      orderId,
      orderItemId: itemId,
      fulfillmentStatus: dto.fulfillmentStatus,
    });
  }

  @Put(':id/cancel-by-client')
  @ApiOperation({
    summary:
      'Cancelar pedido pendente pelo próprio cliente (com validação de propriedade e estorno atômico)',
    description:
      'Cancela um pedido PENDING do próprio usuário autenticado. O status é alterado para CANCELLED e o crédito reservado é devolvido em uma única transação atômica.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do pedido',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Pedido cancelado e crédito restaurado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Pedido não pode ser cancelado (status inválido)',
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido não encontrado ou não pertence ao usuário',
  })
  @HttpCode(HttpStatus.OK)
  async cancelOrderByClient(
    @Param('id') orderId: string,
    @Request() req: any,
  ): Promise<{
    message: string;
    orderId: string;
    creditReleased: number;
    newAvailableCredit: number;
    cancelledAt: string;
  }> {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) {
      throw new NotFoundException('User ID not found in token');
    }

    try {
      const result = await this.cancelOrderByClientApp.execute({
        orderId,
        userId,
      });

      return {
        message: 'Pedido cancelado com sucesso',
        orderId,
        creditReleased: result.creditReleased,
        newAvailableCredit: result.newAvailableCredit,
        cancelledAt: new Date().toISOString(),
      };
    } catch (error) {
      if (
        error.message?.includes('não encontrado') ||
        error.message?.includes('não pertence')
      ) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Put(':id/cancel')
  @ApiOperation({
    summary: '[ADMIN] Cancelar pedido pendente e liberar crédito reservado',
    description:
      'Permite cancelar manualmente um pedido PENDING e libera instantaneamente o crédito que estava reservado.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do pedido',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Pedido cancelado e crédito liberado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Pedido não pode ser cancelado (status inválido)',
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido não encontrado',
  })
  @HttpCode(HttpStatus.OK)
  async cancelPendingOrder(@Param('id') orderId: string): Promise<{
    message: string;
    orderId: string;
    creditReleased: number;
    releasedAt: string;
  }> {
    const order = await this.findOrderByIdApp.execute(orderId);

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.paymentStatus !== 'PENDING') {
      throw new BadRequestException(
        `Order ${orderId} cannot be cancelled (status: ${order.paymentStatus})`,
      );
    }

    await this.updateOrderStatusApp.execute({
      orderId,
      status: 'CANCELLED' as any,
    });

    let creditReleased = 0;
    if (order.creditUsed && order.creditUsed > 0) {
      await this.orderRepository.markCreditRestored(orderId);
      await this.userRepository.releaseReservedCredit(
        order.userId,
        order.creditUsed,
      );
      creditReleased = order.creditUsed;
    }

    return {
      message: 'Pedido cancelado com sucesso',
      orderId,
      creditReleased,
      releasedAt: new Date().toISOString(),
    };
  }

  @Post('admin/cancel-abandoned')
  @ApiOperation({
    summary: '[ADMIN/TEST] Executar job de cancelamento de pedidos abandonados',
    description:
      'Dispara manualmente o job que cancela pedidos PENDING com mais de X horas e restaura créditos. Use hours=0 para testar com todos os pedidos PENDING.',
  })
  @ApiQuery({
    name: 'hours',
    required: false,
    type: Number,
    description:
      'Horas de threshold (padrão: 24). Use 0 para pegar todos os pedidos PENDING.',
  })
  @ApiResponse({
    status: 200,
    description: 'Job executado com sucesso',
  })
  @HttpCode(HttpStatus.OK)
  async cancelAbandonedOrders(
    @Query('hours') hours?: string,
  ): Promise<CancelAbandonedOrdersResult & { executedAt: string }> {
    const hoursThreshold = hours !== undefined ? parseInt(hours, 10) : 24;
    const result = await this.cancelAbandonedOrdersJob.execute(hoursThreshold);
    return {
      ...result,
      executedAt: new Date().toISOString(),
    };
  }
}
