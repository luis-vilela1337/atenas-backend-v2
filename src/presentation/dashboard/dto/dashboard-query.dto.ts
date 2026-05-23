import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsUUID } from 'class-validator';

export class DashboardQueryDto {
  @ApiProperty({
    description: 'Data inicial do periodo (formato ISO: YYYY-MM-DD)',
    required: false,
    example: '2026-05-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Data final do periodo (formato ISO: YYYY-MM-DD)',
    required: false,
    example: '2026-05-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Filtrar por instituicao (UUID)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  institutionId?: string;
}
