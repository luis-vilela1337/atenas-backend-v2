import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class FindProductByIdParamDto {
  @ApiProperty({
    description: 'ID único do produto',
    format: 'uuid',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID(4, { message: 'ID deve ser um UUID válido' })
  id: string;
}
