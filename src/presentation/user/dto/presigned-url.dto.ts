import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class GeneratePresignedUrlInputDto {
  @ApiProperty({ example: 'image/png', description: 'Content-Type do arquivo' })
  @Allow()
  contentType: string;
}

export class PresignedUrlResponseDto {
  @ApiProperty() uploadUrl: string;
  @ApiProperty() filename: string;
}
