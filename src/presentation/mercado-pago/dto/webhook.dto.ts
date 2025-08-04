import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsIn,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class WebhookDataDto {
  @ApiProperty({
    description: 'ID do pagamento ou merchant order',
    example: 'payment_id_123456789',
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class MercadoPagoWebhookDto {
  @ApiProperty({
    description: 'ID da notificação',
    example: '12345678901',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Indica se está em modo de produção',
    example: true,
  })
  @IsBoolean()
  live_mode: boolean;

  @ApiProperty({
    description: 'Tipo da notificação',
    example: 'payment',
    enum: ['payment', 'merchant_order'],
  })
  @IsString()
  @IsIn(['payment', 'merchant_order'])
  type: 'payment' | 'merchant_order';

  @ApiProperty({
    description: 'Data de criação da notificação',
    example: '2024-01-15T10:30:00.000-04:00',
  })
  @IsString()
  @IsNotEmpty()
  date_created: string;

  @ApiProperty({
    description: 'ID do usuário do Mercado Pago',
    example: '2583908542',
  })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    description: 'Versão da API',
    example: 'v1',
  })
  @IsString()
  @IsNotEmpty()
  api_version: string;

  @ApiProperty({
    description: 'Ação que gerou a notificação',
    example: 'payment.created',
  })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({
    description: 'Dados da notificação',
    type: WebhookDataDto,
  })
  @ValidateNested()
  @Type(() => WebhookDataDto)
  data: WebhookDataDto;
}

export class WebhookResponseDto {
  @ApiProperty({
    description: 'Status do processamento',
    example: 'success',
    enum: ['success', 'error'],
  })
  @IsString()
  @IsIn(['success', 'error'])
  status: 'success' | 'error';

  @ApiProperty({
    description: 'Mensagem de resposta',
    example: 'Webhook processed successfully',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Detalhes do erro (opcional)',
    example: 'Detailed error message',
    required: false,
  })
  @IsString()
  @IsOptional()
  error?: string;
}