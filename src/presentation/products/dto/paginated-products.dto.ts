import { ApiProperty } from '@nestjs/swagger';
import { ProductDto } from './product.dto';
import { PaginationMetaDto } from '@presentation/user/dto/pagination-meta.dto';

export class PaginatedProductsDto {
  @ApiProperty({ type: [ProductDto] })
  data: ProductDto[];

  @ApiProperty({ type: () => PaginationMetaDto })
  pagination: PaginationMetaDto;
}
