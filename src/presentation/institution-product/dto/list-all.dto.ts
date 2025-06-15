import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductFlag } from '@infrastructure/data/sql/types/product-flag.enum';
import { InstitutionProductDto } from '@presentation/institution-product/dto/dto';
import { PaginationMetaDto } from '@presentation/user/dto/pagination-meta.dto';

export class ListInstitutionProductsQueryDto {
  @ApiPropertyOptional({
    description: 'Página',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Itens por página',
    minimum: 1,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filtrar por ID do produto',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID(4)
  productId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID da instituição',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID(4)
  institutionId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de produto',
    enum: ProductFlag,
  })
  @IsOptional()
  @IsEnum(ProductFlag)
  flag?: ProductFlag;
}

export class PaginatedInstitutionProductsDto {
  @ApiProperty({ type: [InstitutionProductDto] })
  data: InstitutionProductDto[];

  @ApiProperty({
    type: () => PaginationMetaDto,
  })
  pagination: PaginationMetaDto;
}
