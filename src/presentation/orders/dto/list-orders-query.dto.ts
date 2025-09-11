import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsEnum, IsUUID } from 'class-validator';

export enum PaymentStatusFilter {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export class ListOrdersQueryDto {
  @ApiProperty({
    description: 'Número da página',
    required: false,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Quantidade de itens por página',
    required: false,
    minimum: 1,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({
    description: 'Filtrar por status de pagamento',
    required: false,
    enum: PaymentStatusFilter,
  })
  @IsOptional()
  @IsEnum(PaymentStatusFilter)
  paymentStatus?: PaymentStatusFilter;

  @ApiProperty({
    description: 'Filtrar por ID do usuário',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
