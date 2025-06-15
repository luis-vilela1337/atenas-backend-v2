import { ApiProperty } from '@nestjs/swagger';
import { ProductFlag } from '@infrastructure/data/sql/types/product-flag.enum';

export class ProductDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ProductFlag })
  flag: ProductFlag;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty({ type: [String] })
  photos: string[];

  @ApiProperty({ type: [String] })
  video: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
