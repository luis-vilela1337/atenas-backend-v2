import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsInt, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class GeneratePresignedUrlInputDto {
  @ApiProperty({ example: 'image/png', description: 'Content-Type do arquivo' })
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
  @Min(1, { message: 'Quantidade mínima: 1 foto' })
  @Max(10, { message: 'Quantidade máxima: 10 fotos' })
  quantity: number;
}

export class PresignedUrlItemDto {
  @ApiProperty({ description: 'URL presignada para upload' })
  uploadUrl: string;

  @ApiProperty({ description: 'Nome único do arquivo gerado' })
  filename: string;

  @ApiProperty({ description: 'Índice sequencial da foto (1-based)' })
  index: number;
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
}
