import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentItemDto {
  @ApiProperty({ description: 'ID do item', example: 'item-001' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Título do item', example: 'Produto Premium' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Descrição do item',
    example: 'Descrição detalhada do produto',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Quantidade', example: 1, minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Preço unitário',
    example: 29.99,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  unit_price: number;
}

export class PayerPhoneDto {
  @ApiProperty({ description: 'Código de área', example: '11' })
  @IsString()
  @IsNotEmpty()
  area_code: string;

  @ApiProperty({ description: 'Número do telefone', example: '999999999' })
  @IsString()
  @IsNotEmpty()
  number: string;
}

export class PayerAddressDto {
  @ApiProperty({
    description: 'Nome da rua',
    example: 'Rua das Flores',
  })
  @IsString()
  @IsNotEmpty()
  street_name: string;

  @ApiProperty({ description: 'Número da rua', example: '123' })
  @IsString()
  @IsNotEmpty()
  street_number: string;

  @ApiProperty({ description: 'CEP', example: '01234-567' })
  @IsString()
  @IsNotEmpty()
  zip_code: string;
}

export class PayerDto {
  @ApiProperty({ description: 'Nome do pagador', example: 'João' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Sobrenome do pagador', example: 'Silva' })
  @IsString()
  @IsNotEmpty()
  surname: string;

  @ApiProperty({
    description: 'Email do pagador',
    example: 'joao.silva@email.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Telefone do pagador', type: PayerPhoneDto })
  @ValidateNested()
  @Type(() => PayerPhoneDto)
  phone: PayerPhoneDto;

  @ApiProperty({ description: 'Endereço do pagador', type: PayerAddressDto })
  @ValidateNested()
  @Type(() => PayerAddressDto)
  address: PayerAddressDto;
}

export class CreatePreferenceInputDto {
  @ApiProperty({
    description: 'Lista de itens para pagamento',
    type: [PaymentItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentItemDto)
  items: PaymentItemDto[];

  @ApiProperty({ description: 'Dados do pagador', type: PayerDto })
  @ValidateNested()
  @Type(() => PayerDto)
  payer: PayerDto;
}

export class CreatePreferenceResponseDto {
  @ApiProperty({
    description: 'ID da preferência criada',
    example: '123456789-abcd-1234-efgh-123456789012',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'URL para checkout do Mercado Pago',
    example:
      'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=123456789-abcd-1234-efgh-123456789012',
  })
  @IsString()
  checkoutUrl: string;
}
