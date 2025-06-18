import { ApiProperty } from '@nestjs/swagger';
import { Institution } from '@infrastructure/data/sql/entities';

export class EventDto {
  @ApiProperty({ format: 'uuid', description: 'ID do evento' })
  id: string;

  @ApiProperty({ description: 'Nome do evento' })
  name: string;
}

export class InstitutionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  contractNumber: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  observations?: string;

  @ApiProperty({
    type: [Object],
    description: 'Lista de eventos com ID e nome',
    example: [
      { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Workshop' },
      { id: '123e4567-e89b-12d3-a456-426614174001', name: 'Palestras' },
    ],
  })
  events: EventDto[];

  @ApiProperty({ description: 'Número de usuários associados' })
  userCount: number;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  updatedAt?: Date;

  private constructor(data: Partial<InstitutionResponseDto>) {
    Object.assign(this, data);
  }

  static adapterToResponse(entity: Institution): InstitutionResponseDto {
    const events = entity.events ?? [];
    const users = entity.users ?? [];

    return new InstitutionResponseDto({
      id: entity.id,
      contractNumber: entity.contractNumber,
      name: entity.name,
      observations: entity.observations,
      events: events.map((e) => ({
        id: e.id,
        name: e.name,
      })),
      userCount: users.length,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
