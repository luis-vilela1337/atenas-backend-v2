import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsNumber,
  IsUUID,
  Length,
  Matches,
  Min,
  Max,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole, UserStatus } from '@infrastructure/data/sql/entities';
import { AddressDto } from './address.dto';
import { BecaMeasuresDto } from './beca-measures.dto';

export class CreateUserV2InputDto {
  @ApiProperty({ example: 'João Silva', description: 'Nome completo' })
  @IsString({ message: 'O nome deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome não pode ficar em branco.' })
  @Length(2, 255, {
    message: 'O nome deve ter entre $constraint1 e $constraint2 caracteres.',
  })
  name: string;

  @ApiProperty({ example: 'joao_silva', description: 'Identificador único' })
  @IsString({ message: 'O identificador deve ser um texto.' })
  @IsNotEmpty({ message: 'O identificador não pode ficar em branco.' })
  @Length(1, 50, {
    message: 'O identificador deve ter no máximo $constraint2 caracteres.',
  })
  @Matches(/^[a-zA-Z0-9-_]+$/, {
    message:
      'O identificador só pode conter letras, números, hífen e underscore.',
  })
  identifier: string;

  @ApiProperty({ example: 'joao@exemplo.com', description: 'Email válido' })
  @IsEmail({}, { message: 'O email deve ser válido.' })
  @IsNotEmpty({ message: 'O email não pode ficar em branco.' })
  @Length(5, 255, {
    message: 'O email deve ter entre $constraint1 e $constraint2 caracteres.',
  })
  email: string;

  @ApiProperty({
    example: '(11) 91234-5678',
    description: 'Telefone no formato (XX) XXXXX-XXXX',
  })
  @IsString({ message: 'O telefone deve ser um texto.' })
  @IsNotEmpty({ message: 'O telefone não pode ficar em branco.' })
  @Length(10, 20, {
    message:
      'O telefone deve ter entre $constraint1 e $constraint2 caracteres.',
  })
  @Matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, {
    message:
      'O telefone deve seguir o formato (XX) XXXX-XXXX ou (XX) XXXXX-XXXX.',
  })
  phone: string;

  @ApiPropertyOptional({ description: 'Observações', example: 'Cliente VIP' })
  @IsOptional()
  @IsString({ message: 'As observações devem ser um texto.' })
  @Length(0, 1000, {
    message: 'As observações não podem ultrapassar $constraint2 caracteres.',
  })
  observations?: string;

  @ApiProperty({
    description: 'Senha',
    example: 'senha123',
  })
  @IsString({ message: 'A senha deve ser um texto.' })
  @IsNotEmpty({ message: 'A senha não pode ficar em branco.' })
  @Length(6, 100, {
    message: 'A senha deve ter entre $constraint1 e $constraint2 caracteres.',
  })
  password: string;

  @ApiProperty({ enum: ['admin', 'client'], description: 'Papel do usuário' })
  @IsEnum(['admin', 'client'], {
    message: 'O papel deve ser "admin" ou "client".',
  })
  role: UserRole;

  @ApiProperty({ format: 'uuid', description: 'ID da instituição' })
  @IsUUID('4', { message: 'O institutionId deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'O institutionId não pode ficar em branco.' })
  institutionId: string;

  @ApiPropertyOptional({ description: 'Nome do pai', example: 'José Silva' })
  @IsOptional()
  @IsString({ message: 'O nome do pai deve ser um texto.' })
  @Length(2, 255, {
    message:
      'O nome do pai deve ter entre $constraint1 e $constraint2 caracteres.',
  })
  fatherName?: string;

  @ApiPropertyOptional({
    description: 'Telefone do pai',
    example: '(11) 98765-4321',
  })
  @IsOptional()
  @IsString({ message: 'O telefone do pai deve ser um texto.' })
  @Length(10, 20, {
    message:
      'O telefone do pai deve ter entre $constraint1 e $constraint2 caracteres.',
  })
  @Matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, {
    message:
      'O telefone do pai deve seguir o formato (XX) XXXX-XXXX ou (XX) XXXXX-XXXX.',
  })
  fatherPhone?: string;

  @ApiPropertyOptional({ description: 'Nome da mãe', example: 'Maria Silva' })
  @IsOptional()
  @IsString({ message: 'O nome da mãe deve ser um texto.' })
  @Length(2, 255, {
    message:
      'O nome da mãe deve ter entre $constraint1 e $constraint2 caracteres.',
  })
  motherName?: string;

  @ApiPropertyOptional({
    description: 'Telefone da mãe',
    example: '(11) 98765-4321',
  })
  @IsOptional()
  @IsString({ message: 'O telefone da mãe deve ser um texto.' })
  @Length(10, 20, {
    message:
      'O telefone da mãe deve ter entre $constraint1 e $constraint2 caracteres.',
  })
  @Matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, {
    message:
      'O telefone da mãe deve seguir o formato (XX) XXXX-XXXX ou (XX) XXXXX-XXXX.',
  })
  motherPhone?: string;

  @ApiPropertyOptional({
    description: 'Link do drive',
    example: 'https://drive.google.com/...',
  })
  @IsOptional()
  @IsString({ message: 'O driveLink deve ser um texto.' })
  @Length(1, 500, {
    message: 'O driveLink não pode ultrapassar $constraint2 caracteres.',
  })
  driveLink?: string;

  @ApiPropertyOptional({ example: 1500.5, description: 'Valor de crédito' })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'O creditValue deve ser um número com até 2 casas decimais.' },
  )
  @Min(0, { message: 'O creditValue não pode ser negativo.' })
  @Max(999999.99, { message: 'O creditValue não pode exceder $constraint2.' })
  creditValue?: number;

  @ApiPropertyOptional({
    description: 'Imagem de perfil (nome do arquivo ou URL)',
    example: 'foto.jpg',
  })
  @IsOptional()
  @IsString({ message: 'O profileImage deve ser um texto.' })
  profileImage?: string;

  @ApiPropertyOptional({
    description: 'Endereço completo do usuário',
    type: AddressDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional({
    description: 'CPF do usuário',
    example: '123.456.789-00',
  })
  @IsOptional()
  @IsString({ message: 'O CPF deve ser um texto.' })
  @Length(11, 14, {
    message: 'O CPF deve ter entre $constraint1 e $constraint2 caracteres.',
  })
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, {
    message: 'O CPF deve estar no formato XXX.XXX.XXX-XX ou XXXXXXXXXXX.',
  })
  cpf?: string;

  @ApiPropertyOptional({
    description: 'Medidas da beca',
    type: BecaMeasuresDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BecaMeasuresDto)
  becaMeasures?: BecaMeasuresDto;

  @IsOptional()
  status?: UserStatus;
}

export class CreateUserResponseV2Dto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() name: string;
  @ApiProperty() identifier: string;
  @ApiProperty() email: string;
  @ApiProperty() phone: string;
  @ApiProperty({ nullable: true }) observations: string | null;
  @ApiProperty() role: string;
  @ApiProperty({ format: 'uuid' }) institutionId: string;
  @ApiProperty({ nullable: true }) fatherName: string | null;
  @ApiProperty({ nullable: true }) fatherPhone: string | null;
  @ApiProperty({ nullable: true }) motherName: string | null;
  @ApiProperty({ nullable: true }) motherPhone: string | null;
  @ApiProperty({ nullable: true }) driveLink: string | null;
  @ApiProperty({ nullable: true }) creditValue: number | null;
  @ApiProperty({ nullable: true }) profileImage: string | null;
  @ApiProperty() status: string;
  @ApiProperty({ nullable: true }) zipCode: string | null;
  @ApiProperty({ nullable: true }) street: string | null;
  @ApiProperty({ nullable: true }) number: string | null;
  @ApiProperty({ nullable: true }) complement: string | null;
  @ApiProperty({ nullable: true }) neighborhood: string | null;
  @ApiProperty({ nullable: true }) city: string | null;
  @ApiProperty({ nullable: true }) state: string | null;
  @ApiProperty({ nullable: true }) cpf: string | null;
  @ApiProperty({ nullable: true, type: BecaMeasuresDto }) becaMeasures: BecaMeasuresDto | null;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt: string;
}
