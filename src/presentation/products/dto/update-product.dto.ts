import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateProductParamDto {
  @ApiProperty({ description: 'ID do produto', format: 'uuid' })
  @IsUUID(4, { message: 'ID deve ser um UUID válido' })
  @IsNotEmpty()
  id: string;
}

export class UpdateProductInputDto {
  @ApiProperty({ description: 'Nome do produto', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Descrição do produto', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Fotos do produto (nomes de arquivos ou URLs)',
    type: [String],
    required: false,
    example: [
      'photo-123.jpg',
      'https://storage.googleapis.com/bucket/photo-456.png',
    ],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @ApiProperty({
    description: 'Vídeos do produto (nomes de arquivos ou URLs)',
    type: [String],
    required: false,
    example: [
      'video-123.mp4',
      'https://storage.googleapis.com/bucket/video-456.mp4',
    ],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  video?: string[];
}

export class UpdateProductResponseDto {
  @ApiProperty({ description: 'ID do produto', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Nome do produto' })
  name: string;

  @ApiProperty({ description: 'Flag do produto (não alterável)' })
  flag: string;

  @ApiProperty({ description: 'Descrição do produto' })
  description: string;

  @ApiProperty({ description: 'Nomes dos arquivos de fotos', type: [String] })
  photos: string[];

  @ApiProperty({ description: 'Nomes dos arquivos de vídeos', type: [String] })
  video: string[];

  @ApiProperty({ description: 'Data de criação', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', format: 'date-time' })
  updatedAt: Date;
}
