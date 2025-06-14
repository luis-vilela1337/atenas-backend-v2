import { Injectable, NotFoundException } from '@nestjs/common';
import { InstitutionSQLRepository } from '@infrastructure/data/sql/repositories/institution.repository';
import { Institution } from '@infrastructure/data/sql/entities';
import { UpdateInstituitionDto } from '@presentation/instituitions/dto/update.instituition';
import { UpdateInstitutionData } from '@infrastructure/data/sql/types/insituition.type';

@Injectable()
export class UpdateInstituitionUseCase {
  constructor(private readonly repo: InstitutionSQLRepository) {}
  async execute(
    id: string,
    input: UpdateInstituitionDto,
  ): Promise<Institution> {
    const exists = await this.repo.findById(id);
    if (!exists) {
      throw new NotFoundException(`Instituição com id "${id}" não encontrada`);
    }

    const payload: UpdateInstitutionData = {
      contractNumber: input.contractNumber,
      name: input.name,
      observations: input.observations,
      events: input.events?.map((e) => ({ name: e.name })),
    };

    const updated = await this.repo.updateInstitution(id, payload);

    if (!updated) {
      throw new NotFoundException(`Falha ao atualizar instituição "${id}"`);
    }
    return updated;
  }
}
