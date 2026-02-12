import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCartDto {
  @ApiProperty({
    description: 'Array de itens do carrinho',
    type: [Object],
    example: [],
  })
  @IsArray()
  @Transform(({ obj }) => obj.items, { toClassOnly: true })
  items: any[];
}

export class CartResponseDto {
  @ApiProperty({
    description: 'Array de itens do carrinho',
    type: [Object],
  })
  items: any[];
}
