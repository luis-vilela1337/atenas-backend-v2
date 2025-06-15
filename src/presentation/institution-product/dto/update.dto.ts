import { ApiProperty } from '@nestjs/swagger';
import { ProductFlag } from '@infrastructure/data/sql/types/product-flag.enum';
import { IsEnum, IsObject, IsOptional } from 'class-validator';

export class UpdateInstitutionProductInputDto {
  @ApiProperty({
    description: 'Tipo de produto',
    enum: ProductFlag,
    required: false,
  })
  @IsEnum(ProductFlag)
  @IsOptional()
  flag?: ProductFlag;

  @ApiProperty({
    description: 'Detalhes de configuração do produto (JSON)',
    required: false,
    type: Object,
  })
  @IsObject()
  @IsOptional()
  details?: Record<string, any>;
}
