import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class UpdateCartDto {
  @ApiProperty({
    description: 'Array de itens do carrinho',
    type: [Object],
    example: [],
  })
  @IsArray()
  items: any[];
}

export class CartResponseDto {
  @ApiProperty({
    description: 'Array de itens do carrinho',
    type: [Object],
  })
  items: any[];
}
