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
  details?: ProductDetails | null;
}

export class UpdateInstitutionProductResponseDto {
  @ApiProperty({
    description: 'ID único da relação produto-instituição',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID do produto',
    format: 'uuid',
    example: '987fcdeb-51a2-43d7-c456-426614174111',
  })
  productId: string;

  @ApiProperty({
    description: 'ID da instituição',
    format: 'uuid',
    example: '456e7890-e89b-12d3-a456-426614174222',
  })
  institutionId: string;

  @ApiProperty({
    description: 'Flag do produto',
    enum: ProductFlag,
    example: ProductFlag.ALBUM,
  })
  flag: ProductFlag;

  @ApiPropertyOptional({
    description: 'Detalhes específicos do produto para a instituição',
    type: Object,
    nullable: true,
  })
  details?: ProductDetails | null;

  @ApiProperty({
    description: 'Data de criação da relação',
    type: Date,
    example: '2024-01-15T10:00:00Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Data da última atualização',
    type: Date,
    example: '2024-01-16T15:30:00Z',
    nullable: true,
  })
  updatedAt?: Date;
}
