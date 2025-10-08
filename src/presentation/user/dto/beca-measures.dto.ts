import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, Length } from 'class-validator';

export class BecaMeasuresDto {
  @ApiPropertyOptional({
    description: 'Comprimento da beca',
    example: '150cm',
  })
  @IsOptional()
  @IsString({ message: 'O comprimento deve ser um texto.' })
  @Length(1, 50, {
    message:
      'O comprimento deve ter entre $constraint1 e $constraint2 caracteres.',
  })
  comprimento?: string;

  @ApiPropertyOptional({
    description: 'Medida da cintura',
    example: '70cm',
  })
  @IsOptional()
  @IsString({ message: 'A cintura deve ser um texto.' })
  @Length(1, 50, {
    message: 'A cintura deve ter entre $constraint1 e $constraint2 caracteres.',
  })
  cintura?: string;

  @ApiPropertyOptional({
    description: 'Medida do busto',
    example: '85cm',
  })
  @IsOptional()
  @IsString({ message: 'O busto deve ser um texto.' })
  @Length(1, 50, {
    message: 'O busto deve ter entre $constraint1 e $constraint2 caracteres.',
  })
  busto?: string;

  @ApiPropertyOptional({
    description: 'Medida do quadril',
    example: '90cm',
  })
  @IsOptional()
  @IsString({ message: 'O quadril deve ser um texto.' })
  @Length(1, 50, {
    message: 'O quadril deve ter entre $constraint1 e $constraint2 caracteres.',
  })
  quadril?: string;
}
