import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class DeleteInstitutionProductParamDto {
  @ApiProperty({
    description: 'ID da relação produto-instituição',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'ID deve ser um UUID válido' })
  id: string;
}
