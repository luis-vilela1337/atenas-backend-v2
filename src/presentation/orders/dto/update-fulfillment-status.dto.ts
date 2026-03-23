import { IsEnum, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FulfillmentStatus } from '@core/orders/entities/order.entity';

export class UpdateFulfillmentStatusDto {
  @ApiProperty({
    description: 'Novo status de fulfillment do item',
    enum: FulfillmentStatus,
    example: FulfillmentStatus.PHOTOS_SEPARATED,
  })
  @IsEnum(FulfillmentStatus)
  @IsNotEmpty()
  fulfillmentStatus: FulfillmentStatus;

  @ApiProperty({
    description:
      'Link do Google Drive para download de arquivos digitais (obrigatório quando fulfillmentStatus é SENT e o item é DIGITAL_FILES)',
    example: 'https://drive.google.com/file/d/1234567890/view',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  driveLink?: string;
}

export class UpdateFulfillmentStatusResponseDto {
  @ApiProperty({
    description: 'Mensagem de sucesso',
    example: 'Status de fulfillment atualizado com sucesso',
  })
  message: string;

  @ApiProperty({
    description: 'ID do item atualizado',
    example: 'uuid-do-item',
  })
  orderItemId: string;

  @ApiProperty({
    description: 'Novo status de fulfillment',
    enum: FulfillmentStatus,
    example: FulfillmentStatus.PHOTOS_SEPARATED,
  })
  fulfillmentStatus: FulfillmentStatus;

  @ApiProperty({
    description: 'Tipo do produto do item',
    example: 'ALBUM',
  })
  productType: string;

  @ApiProperty({
    description: 'Data de finalização do item',
    required: false,
  })
  completedAt?: Date;
}
