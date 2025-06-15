import { ApiProperty } from '@nestjs/swagger';
import { ProductFlag } from '@infrastructure/data/sql/types/product-flag.enum';

export class InstitutionProductDto {
  @ApiProperty({ description: 'ID da relação', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Informações do produto' })
  product: {
    id: string;
    name: string;
    flag: ProductFlag;
  };

  @ApiProperty({ description: 'Informações da instituição' })
  institution: {
    id: string;
    name: string;
    contractNumber: string;
  };

  @ApiProperty({ description: 'Tipo de produto', enum: ProductFlag })
  flag: ProductFlag;

  @ApiProperty({
    description: 'Detalhes de configuração',
    type: Object,
    nullable: true,
  })
  details: Record<string, any> | null;

  @ApiProperty({ description: 'Data de criação', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', format: 'date-time' })
  updatedAt?: Date;
}
