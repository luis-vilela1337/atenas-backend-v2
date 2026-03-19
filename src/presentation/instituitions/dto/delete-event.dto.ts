import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class DeleteEventParamDto {
  @ApiProperty({ description: 'ID do evento', format: 'uuid' })
  @IsUUID(4)
  eventId: string;
}
