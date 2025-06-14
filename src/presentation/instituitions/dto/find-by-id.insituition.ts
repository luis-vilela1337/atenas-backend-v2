import { ApiProperty } from '@nestjs/swagger';
import { Institution } from '@infrastructure/data/sql/entities';

export class InstitutionResponseDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() contractNumber: string;
  @ApiProperty() name: string;
  @ApiProperty({ nullable: true }) observations?: string;
  @ApiProperty({ type: [String] }) events: string[];
  @ApiProperty({ description: 'Número de usuários associados' })
  userCount: number;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt: Date;
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
      events: events.map((e) => e.name),
      userCount: users.length,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
