import { IsEnum, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@core/orders/entities/order.entity';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Novo status do pedido',
    enum: OrderStatus,
    example: OrderStatus.COMPLETED,
  })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;

  @ApiProperty({
    description:
      'Link do Google Drive para download de arquivos digitais (obrigatório quando status é COMPLETED e pedido contém arquivos digitais)',
    example: 'https://drive.google.com/file/d/1234567890/view',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  driveLink?: string;
}

export class UpdateOrderStatusResponseDto {
  @ApiProperty({
    description: 'Mensagem de sucesso',
    example: 'Status do pedido atualizado com sucesso',
  })
  message: string;

  @ApiProperty({
    description: 'ID do pedido atualizado',
    example: 'uuid-do-pedido',
  })
  orderId: string;

  @ApiProperty({
    description: 'Novo status do pedido',
    enum: OrderStatus,
    example: OrderStatus.COMPLETED,
  })
  status: OrderStatus;
}
