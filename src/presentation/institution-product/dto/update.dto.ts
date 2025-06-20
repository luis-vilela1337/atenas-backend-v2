import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsUUID } from 'class-validator';
import { ProductFlag } from '@infrastructure/data/sql/types/product-flag.enum';
import { ProductDetails } from '@infrastructure/data/sql/entities';

export class UpdateInstitutionProductParamDto {
  @ApiProperty({
    description: 'ID da relação produto-instituição',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'ID deve ser um UUID válido' })
  id: string;
}

export class UpdateInstitutionProductInputDto {
  @IsOptional()
  @IsObject({ message: 'Details deve ser um objeto válido' })
  details?: Record<string, any> | null;
}

export class UpdateInstitutionProductResponseDto {
  @ApiProperty({
    description: 'ID da relação produto-instituição',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID do produto',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  productId: string;

  @ApiProperty({
    description: 'ID da instituição',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  institutionId: string;

  @ApiProperty({
    description: 'Flag do produto',
    enum: ProductFlag,
    example: ProductFlag.ALBUM,
  })
  flag: ProductFlag;

  @ApiPropertyOptional({
    description: 'Detalhes específicos do produto',
    type: Object,
    nullable: true,
  })
  details: ProductDetails | null;

  @ApiProperty({
    description: 'Data de criação',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}
