import { ApiProperty } from '@nestjs/swagger';
import { OrderDto } from './order-response.dto';

export class OrderListMetaDto {
  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  itemCount: number;

  @ApiProperty()
  itemsPerPage: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  currentPage: number;
}

export class OrderListResponseDto {
  @ApiProperty({ type: [OrderDto] })
  data: OrderDto[];

  @ApiProperty({ type: OrderListMetaDto })
  meta: OrderListMetaDto;
}
