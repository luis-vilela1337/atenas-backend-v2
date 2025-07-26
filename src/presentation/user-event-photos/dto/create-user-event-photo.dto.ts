import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsUUID, ArrayMinSize } from 'class-validator';

export class CreateUserEventPhotoDto {
  @ApiProperty({ format: 'uuid', description: 'ID do usuário (aluno)' })
  @IsUUID(4, { message: 'userId deve ser um UUID válido' })
  userId: string;

  @ApiProperty({ format: 'uuid', description: 'ID do evento' })
  @IsUUID(4, { message: 'eventId deve ser um UUID válido' })
  eventId: string;

  @ApiProperty({
    type: [String],
    description: 'Lista de nomes de arquivos ou URLs completas do storage',
    example: [
      'image-abc123-1234567890.jpg',
      'https://storage.example.com/bucket/image-def456.png',
    ],
  })
  @IsArray({ message: 'fileNames deve ser um array' })
  @ArrayMinSize(1, { message: 'Pelo menos um arquivo deve ser fornecido' })
  @IsString({ each: true, message: 'Cada fileName deve ser uma string' })
  fileNames: string[];
}
