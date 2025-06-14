import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  Length,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class EventDto {
  @ApiProperty({ example: 'Workshop', description: 'Nome do evento' })
  @IsString()
  @Length(1, 255)
  name: string;
}

export class CreateInstituitionDto {
  @ApiProperty({ example: 'CNT-001', description: 'Número do contrato' })
  @IsString()
  @Length(1, 50)
  contractNumber: string;

  @ApiProperty({ example: 'Inatel', description: 'Nome da instituição' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiPropertyOptional({
    description: 'Observações',
    example: 'Parceria de longa data',
  })
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiProperty({ type: [EventDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventDto)
  events: EventDto[];
}
