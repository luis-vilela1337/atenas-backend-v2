import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ProductFlag } from '@infrastructure/data/sql/types/product-flag.enum';

export class CreateProductInputDto {
  @ApiProperty({ description: 'Nome do produto', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Categoria do produto',
    enum: ProductFlag,
    default: ProductFlag.GENERIC,
  })
  @IsEnum(ProductFlag)
  @IsOptional()
  flag?: ProductFlag;

  @ApiProperty({ description: 'Descrição do produto', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'URLs das fotos do produto',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @ApiProperty({
    description: 'URLs dos vídeos do produto',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  video?: string[];
}

export class CreateProductResponseDto {
  @ApiProperty({ description: 'ID do produto criado', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Nome do produto' })
  name: string;

  @ApiProperty({ description: 'Categoria do produto', enum: ProductFlag })
  flag: ProductFlag;

  @ApiProperty({ description: 'Descrição do produto' })
  description: string;

  @ApiProperty({ description: 'URLs das fotos', type: [String] })
  photos: string[];

  @ApiProperty({ description: 'URLs dos vídeos', type: [String] })
  video: string[];

  @ApiProperty({ description: 'Data de criação', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', format: 'date-time' })
  updatedAt: Date;
}
