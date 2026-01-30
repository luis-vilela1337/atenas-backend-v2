import { Injectable, NotFoundException } from '@nestjs/common';
import { InstitutionEventSQLRepository } from '@infrastructure/data/sql/repositories/institution-event.repository';

@Injectable()
export class DeleteEventUseCase {
  constructor(private readonly repo: InstitutionEventSQLRepository) {}

  async execute(eventId: string): Promise<void> {
    const existing = await this.repo.findById(eventId);
    if (!existing) {
      throw new NotFoundException(`Evento com id "${eventId}" não encontrado`);
    }
    await this.repo.softDelete(eventId);
  }
}
