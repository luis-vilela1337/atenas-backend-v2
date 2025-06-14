import { Injectable, NotFoundException } from '@nestjs/common';
import { InstitutionSQLRepository } from '@infrastructure/data/sql/repositories/institution.repository';

@Injectable()
export class DeleteInstituitionUseCase {
  constructor(private readonly repo: InstitutionSQLRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Instituição com id "${id}" não encontrada`);
    }
    await this.repo.hardDelete(id);
  }
}
