import { IsOptional, IsInt, Min, Max, IsIn, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { InstitutionResponseDto } from './find-by-id.insituition';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Institution } from '@infrastructure/data/sql/entities';

export class ListInstituitionQueryDto {
  @ApiPropertyOptional({ description: 'Página (>=1)', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Itens por página (<=100)', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Texto para busca',
    example: 'Universidade',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Campo para ordenação', example: 'name' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Ordem de ordenação',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';
}

export class ListInstitutionsResponseDto {
  @ApiProperty({ type: [InstitutionResponseDto] })
  data: InstitutionResponseDto[];

  @ApiProperty({ example: { total: 0, page: 1, limit: 10, totalPages: 0 } })
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  private constructor(init: Partial<ListInstitutionsResponseDto>) {
    Object.assign(this, init);
  }

  static adapterToResponse(
    entities: Institution[],
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    },
  ): ListInstitutionsResponseDto {
    const data = entities.map((entity) =>
      InstitutionResponseDto.adapterToResponse(entity),
    );
    return new ListInstitutionsResponseDto({ data, pagination });
  }
}
