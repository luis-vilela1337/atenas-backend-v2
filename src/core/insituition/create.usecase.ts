import { Injectable } from '@nestjs/common';
import { InstitutionSQLRepository } from '@infrastructure/data/sql/repositories/institution.repository';
import { Institution } from '@infrastructure/data/sql/entities';
import { CreateInstituitionDto } from '@presentation/instituitions/dto/create.instituition';

@Injectable()
export class CreateInstituitionUseCase {
  constructor(private readonly repo: InstitutionSQLRepository) {}

  async execute(input: CreateInstituitionDto): Promise<Institution> {
    const inst = await this.repo.createInstitution({
      contractNumber: input.contractNumber,
      name: input.name,
      observations: input.observations,
      events: input.events.map((e) => ({ name: e.name } as any)),
    });
    return inst;
  }
}
