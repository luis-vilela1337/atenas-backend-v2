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

export class UpdateUserV2InputDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 255)
  name: string;
  @ApiProperty({ example: 'joao_silva' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  @Matches(/^[a-zA-Z0-9-_]+$/)
  identifier: string;
  @ApiProperty({ example: 'joao@exemplo.com' })
  @IsEmail()
  @IsNotEmpty()
  @Length(5, 255)
  email: string;
  @ApiProperty({ example: '(11) 91234-5678' })
  @IsString()
  @IsNotEmpty()
  @Length(10, 20)
  @Matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
  phone: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  observations?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(6, 100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/)
  password?: string;
  @ApiProperty({ enum: ['admin', 'client'] })
  @IsEnum(['admin', 'client'])
  role: UserRole;
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  institutionId: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 255)
  fatherName?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(10, 20)
  @Matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
  fatherPhone?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 255)
  motherName?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(10, 20)
  @Matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
  motherPhone?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 500)
  driveLink?: string;
  @ApiPropertyOptional({ example: 1500.5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(999999.99)
  creditValue?: number;
  @ApiPropertyOptional({
    description: 'Imagem de perfil (nome do arquivo ou URL)',
    example: 'foto.jpg',
  })
  @IsOptional()
  @IsString()
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

  status?: UserStatus;
}

export class UpdateUserV2ResponseDto {
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
  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  updatedAt: string | null;
}
