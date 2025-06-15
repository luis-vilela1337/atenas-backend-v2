import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ProductFlag } from '@infrastructure/data/sql/types/product-flag.enum';

export class ListProductsQueryDto {
  @ApiPropertyOptional({ description: 'Página', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items por página',
    minimum: 1,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Buscar por nome do produto' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por flag do produto',
    enum: ProductFlag,
  })
  @IsOptional()
  @IsEnum(ProductFlag)
  flag?: ProductFlag;

  @ApiPropertyOptional({
    description: 'Ordenar por campo',
    enum: ['name', 'created_at', 'updated_at'],
  })
  @IsOptional()
  @IsString()
  sortBy?: 'name' | 'created_at' | 'updated_at';

  @ApiPropertyOptional({
    description: 'Direção da ordenação',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc' = 'desc';
}
