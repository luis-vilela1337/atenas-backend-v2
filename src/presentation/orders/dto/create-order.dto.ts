import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
  ValidateNested,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ConditionalShipping } from '../validators/conditional-shipping.validator';

export class ShippingDetailsDto {
  @ApiProperty({ description: 'CEP de entrega', example: '01234-567' })
  @IsString()
  @IsNotEmpty()
  zipCode!: string;

  @ApiProperty({ description: 'Nome da rua', example: 'Rua das Flores' })
  @IsString()
  @IsNotEmpty()
  street!: string;

  @ApiProperty({ description: 'Número do endereço', example: '123' })
  @IsString()
  @IsNotEmpty()
  number!: string;

  @ApiProperty({
    description: 'Complemento do endereço',
    example: 'Apartamento 45',
    required: false,
  })
  @IsString()
  @IsOptional()
  complement?: string;

  @ApiProperty({ description: 'Bairro', example: 'Centro' })
  @IsString()
  @IsNotEmpty()
  neighborhood!: string;

  @ApiProperty({ description: 'Cidade', example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ description: 'Estado', example: 'SP' })
  @IsString()
  @IsNotEmpty()
  state!: string;
}

export class PayerPhoneDto {
  @ApiProperty({ description: 'Código de área', example: '11' })
  @IsString()
  @IsNotEmpty()
  areaCode!: string;

  @ApiProperty({ description: 'Número do telefone', example: '999999999' })
  @IsString()
  @IsNotEmpty()
  number!: string;
}

export class PayerDto {
  @ApiProperty({ description: 'Primeiro nome', example: 'João' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ description: 'Último nome', example: 'Silva' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ description: 'Email', example: 'joao.silva@email.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'Telefone', type: PayerPhoneDto })
  @ValidateNested()
  @Type(() => PayerPhoneDto)
  phone!: PayerPhoneDto;
}

export class PhotoSelectionDto {
  @ApiProperty({ description: 'ID da foto', example: 'uuid-photo-id' })
  @IsUUID()
  id!: string;

  @ApiProperty({ description: 'ID do evento', example: 'uuid-event-id' })
  @IsUUID()
  eventId!: string;
}

export class EventSelectionDto {
  @ApiProperty({ description: 'ID do evento', example: 'uuid-event-id' })
  @IsUUID()
  id!: string;

  @ApiProperty({ description: 'Se é um pacote completo', example: true })
  @IsBoolean()
  isPackage!: boolean;
}

export class SelectionDetailsDto {
  @ApiProperty({
    description: 'Fotos selecionadas (para GENERIC e DIGITAL_FILES unitário)',
    type: [PhotoSelectionDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhotoSelectionDto)
  @IsOptional()
  photos?: PhotoSelectionDto[];

  @ApiProperty({
    description: 'Eventos selecionados (para DIGITAL_FILES pacote)',
    type: [EventSelectionDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventSelectionDto)
  @IsOptional()
  events?: EventSelectionDto[];

  @ApiProperty({
    description:
      'Se é pacote completo (não pode ser usado junto com outras seleções)',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isFullPackage?: boolean;

  @ApiProperty({
    description: 'IDs das fotos do álbum (para ALBUM)',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  albumPhotos?: string[];
}

export class CartItemDto {
  @ApiProperty({ description: 'ID do produto', example: 'uuid-product-id' })
  @IsUUID()
  productId!: string;

  @ApiProperty({
    description: 'Nome do produto',
    example: 'Pacote de Fotos Premium',
  })
  @IsString()
  @IsNotEmpty()
  productName!: string;

  @ApiProperty({
    description: 'Tipo do produto',
    enum: ['GENERIC', 'DIGITAL_FILES', 'ALBUM'],
    example: 'DIGITAL_FILES',
  })
  @IsEnum(['GENERIC', 'DIGITAL_FILES', 'ALBUM'])
  productType!: 'GENERIC' | 'DIGITAL_FILES' | 'ALBUM';

  @ApiProperty({
    description: 'Preço total do item',
    example: 29.99,
    minimum: 0.0,
  })
  @IsNumber()
  @Min(0.0)
  totalPrice!: number;

  @ApiProperty({
    description: 'Detalhes da seleção do item',
    type: SelectionDetailsDto,
  })
  @ValidateNested()
  @Type(() => SelectionDetailsDto)
  selectionDetails!: SelectionDetailsDto;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Itens do carrinho',
    type: [CartItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  cartItems!: CartItemDto[];

  @ApiProperty({
    description:
      'Detalhes de entrega (obrigatório apenas para produtos físicos)',
    type: ShippingDetailsDto,
    required: false,
  })
  @ValidateIf((o) =>
    o.cartItems.some(
      (item: CartItemDto) => item.productType !== 'DIGITAL_FILES',
    ),
  )
  @ValidateNested()
  @Type(() => ShippingDetailsDto)
  @ConditionalShipping('cartItems')
  shippingDetails?: ShippingDetailsDto;

  @ApiProperty({
    description: 'Dados do pagador',
    type: PayerDto,
  })
  @ValidateNested()
  @Type(() => PayerDto)
  payer!: PayerDto;
}

export class CreateOrderResponseDto {
  @ApiProperty({
    description: 'ID do pedido criado',
    example: 'uuid-order-id',
  })
  @IsUUID()
  orderId!: string;

  @ApiProperty({
    description: 'URL de checkout do Mercado Pago',
    example: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=123',
  })
  @IsString()
  mercadoPagoCheckoutUrl!: string;
}
