import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { ProductFlag } from '@infrastructure/data/sql/types/product-flag.enum';

export class CreateInstitutionProductInputDto {
  @ApiProperty({
    description: 'ID do produto',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4)
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'ID da instituição',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID(4)
  @IsNotEmpty()
  institutionId: string;
}

export class CreateInstitutionProductResponseDto {
  @ApiProperty({ description: 'ID da relação criada', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'ID do produto', format: 'uuid' })
  productId: string;

  @ApiProperty({ description: 'ID da instituição', format: 'uuid' })
  institutionId: string;

  @ApiProperty({ description: 'Tipo de produto', enum: ProductFlag })
  flag: ProductFlag;

  @ApiProperty({
    description: 'Detalhes de configuração',
    type: Object,
    nullable: true,
  })
  details: Record<string, any> | null;

  @ApiProperty({ description: 'Data de criação', format: 'date-time' })
  createdAt: Date;
}
