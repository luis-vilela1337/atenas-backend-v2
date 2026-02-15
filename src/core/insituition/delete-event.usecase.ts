import { Injectable, NotFoundException } from '@nestjs/common';
import { InstitutionEventSQLRepository } from '@infrastructure/data/sql/repositories/institution-event.repository';
import { InstitutionProductSQLRepository } from '@infrastructure/data/sql/repositories/institution-product.repostitoy';

@Injectable()
export class DeleteEventUseCase {
  constructor(
    private readonly repo: InstitutionEventSQLRepository,
    private readonly institutionProductRepo: InstitutionProductSQLRepository,
  ) {}

  async execute(eventId: string): Promise<void> {
    const existing = await this.repo.findById(eventId);
    if (!existing) {
      throw new NotFoundException(`Evento com id "${eventId}" não encontrado`);
    }
    await this.institutionProductRepo.removeEventFromDetails(eventId);
    await this.repo.softDelete(eventId);
  }
}
