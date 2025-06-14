import { Injectable, NotFoundException } from '@nestjs/common';
import { InstitutionSQLRepository } from '@infrastructure/data/sql/repositories/institution.repository';
import { Institution } from '@infrastructure/data/sql/entities';

@Injectable()
export class FindByIdInstituitionUseCase {
  constructor(private readonly repo: InstitutionSQLRepository) {}

  async execute(id: string): Promise<Institution> {
    const inst = await this.repo.getInstitutionWithUsersAndEvents(id);
    if (!inst) throw new NotFoundException('Institution not found');
    return inst;
  }
}
