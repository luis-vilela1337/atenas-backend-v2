import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  Length,
  Matches,
} from 'class-validator';

export class AddressDto {
  @ApiPropertyOptional({
    description: 'CEP de entrega',
    example: '01310-100',
    pattern: '^[0-9]{5}-?[0-9]{3}$',
  })
  @IsOptional()
  @IsString({ message: 'O CEP deve ser um texto.' })
  @Matches(/^[0-9]{5}-?[0-9]{3}$/, {
    message: 'O CEP deve estar no formato 00000-000 ou 00000000.',
  })
  zipCode?: string;

  @ApiPropertyOptional({
    description: 'Nome da rua/logradouro',
    example: 'Avenida Paulista',
  })
  @IsOptional()
  @IsString({ message: 'A rua deve ser um texto.' })
  @Length(1, 255, {
    message: 'A rua deve ter entre $constraint1 e $constraint2 caracteres.',
  })
  street?: string;

  @ApiPropertyOptional({
    description: 'Número do endereço',
    example: '1578',
  })
  @IsOptional()
  @IsString({ message: 'O número deve ser um texto.' })
  @Length(1, 20, {
    message: 'O número deve ter entre $constraint1 e $constraint2 caracteres.',
  })
  number?: string;

  @ApiPropertyOptional({
    description: 'Complemento do endereço',
    example: 'Conjunto 405',
  })
  @IsOptional()
  @IsString({ message: 'O complemento deve ser um texto.' })
  @Length(1, 255, {
    message:
      'O complemento deve ter entre $constraint1 e $constraint2 caracteres.',
  })
  complement?: string;

  @ApiPropertyOptional({
    description: 'Bairro/distrito',
    example: 'Bela Vista',
  })
  @IsOptional()
  @IsString({ message: 'O bairro deve ser um texto.' })
  @Length(1, 255, {
    message: 'O bairro deve ter entre $constraint1 e $constraint2 caracteres.',
  })
  neighborhood?: string;

  @ApiPropertyOptional({
    description: 'Cidade',
    example: 'São Paulo',
  })
  @IsOptional()
  @IsString({ message: 'A cidade deve ser um texto.' })
  @Length(1, 255, {
    message: 'A cidade deve ter entre $constraint1 e $constraint2 caracteres.',
  })
  city?: string;

  @ApiPropertyOptional({
    description: 'Estado (UF)',
    example: 'SP',
    maxLength: 2,
  })
  @IsOptional()
  @IsString({ message: 'O estado deve ser um texto.' })
  @Length(2, 2, {
    message: 'O estado deve ter exatamente 2 caracteres (UF).',
  })
  @Matches(/^[A-Z]{2}$/, {
    message: 'O estado deve estar em maiúsculo (ex: SP, RJ, MG).',
  })
  state?: string;
}
