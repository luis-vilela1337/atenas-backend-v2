import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from '../../user/dto/address.dto';

export class UpdateProfileInputDto {
  @ApiPropertyOptional({
    description: 'Nome completo do usuário',
    example: 'João Silva',
  })
  @IsOptional()
  @IsString({ message: 'O nome deve ser um texto.' })
  @Length(2, 255, {
    message: 'O nome deve ter entre $constraint1 e $constraint2 caracteres.',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Email do usuário',
    example: 'joao@exemplo.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'O email deve ser um endereço de email válido.' })
  @Length(5, 255, {
    message: 'O email deve ter entre $constraint1 e $constraint2 caracteres.',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Telefone no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX',
    example: '(11) 91234-5678',
  })
  @IsOptional()
  @IsString({ message: 'O telefone deve ser um texto.' })
  @Matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, {
    message:
      'O telefone deve estar no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Nova senha do usuário',
    example: 'novaSenha123',
  })
  @IsOptional()
  @IsString({ message: 'A senha deve ser um texto.' })
  @Length(6, 100, {
    message: 'A senha deve ter entre $constraint1 e $constraint2 caracteres.',
  })
  password?: string;

  @ApiPropertyOptional({
    description: 'Nome do arquivo ou URL da foto de perfil',
    example: '2025-01-06T10:30:00.000Z+foto-perfil.jpg',
  })
  @IsOptional()
  @IsString({ message: 'A foto de perfil deve ser um texto.' })
  profileImage?: string;

  @ApiPropertyOptional({
    description: 'Dados de endereço do usuário',
    type: AddressDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}

export class AddressResponseDto {
  zipCode: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
}

export class UpdateProfileResponseDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string | null;
  address: AddressResponseDto;
  updatedAt: string;
}
