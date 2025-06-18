import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUUID, Length, ValidateNested, } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateEventDto {
  @ApiPropertyOptional({
    format: 'uuid',
    description: 'ID do evento (opcional para novos eventos)',
  })
  @IsOptional()
  @IsUUID(4)
  id?: string;

  @ApiProperty({
    example: 'Workshop Atualizado',
    description: 'Nome do evento',
  })
  @IsString()
  @Length(1, 255)
  name: string;
}

export class UpdateInstituitionDto {
  @ApiPropertyOptional({
    example: 'CNT-002',
    description: 'Número do contrato',
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  contractNumber?: string;

  @ApiPropertyOptional({
    example: 'Nova Instituição',
    description: 'Nome da instituição',
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Observações',
    example: 'Observações atualizadas',
  })
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiPropertyOptional({
    type: [UpdateEventDto],
    description:
      'Lista de eventos (substitui completamente os eventos existentes)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateEventDto)
  events?: UpdateEventDto[];
}
