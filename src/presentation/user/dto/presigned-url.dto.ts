import { ApiProperty } from '@nestjs/swagger';
import {
  Allow,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

export class GeneratePresignedUrlInputDto {
  @ApiProperty({
    example: 'image/png',
    description: 'Content-Type do arquivo',
    examples: {
      image: { value: 'image/png' },
      video: { value: 'video/mp4' },
    },
  })
  @IsString()
  @Allow()
  contentType: string;

  @ApiProperty({
    example: 5,
    description: 'Quantidade de URLs presignadas a serem geradas',
    minimum: 1,
    maximum: 10,
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: 'Quantidade deve ser um número inteiro' })
  @Min(1, { message: 'Quantidade mínima: 1 arquivo' })
  @Max(10, { message: 'Quantidade máxima: 10 arquivos' })
  quantity: number;

  @ApiProperty({
    enum: MediaType,
    description: 'Tipo de mídia (auto-detectado se não informado)',
    required: false,
  })
  @IsOptional()
  @IsEnum(MediaType)
  mediaType?: MediaType;
}

export class PresignedUrlItemDto {
  @ApiProperty({ description: 'URL presignada para upload' })
  uploadUrl: string;

  @ApiProperty({ description: 'Nome único do arquivo gerado' })
  filename: string;

  @ApiProperty({ description: 'Índice sequencial do arquivo (1-based)' })
  index: number;

  @ApiProperty({
    enum: MediaType,
    description: 'Tipo de mídia detectado',
  })
  mediaType: MediaType;
}

export class PresignedUrlResponseDto {
  @ApiProperty({
    type: [PresignedUrlItemDto],
    description: 'Array de URLs presignadas geradas',
  })
  urls: PresignedUrlItemDto[];

  @ApiProperty({ description: 'Quantidade total de URLs geradas' })
  totalGenerated: number;

  @ApiProperty({ description: 'Timestamp de geração' })
  generatedAt: string;

  @ApiProperty({
    enum: MediaType,
    description: 'Tipo de mídia processado',
  })
  mediaType: MediaType;
}
