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
  @Transform(({ value }) => value, { toClassOnly: true })
  items: any[];
}

export class CartResponseDto {
  @ApiProperty({
    description: 'Array de itens do carrinho',
    type: [Object],
  })
  items: any[];
}
