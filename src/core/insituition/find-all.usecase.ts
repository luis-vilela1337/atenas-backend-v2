import { Institution } from '@infrastructure/data/sql/entities';
import { InstitutionSQLRepository } from '@infrastructure/data/sql/repositories/institution.repository';
import { Injectable } from '@nestjs/common';
import { ListInstituitionQueryDto } from '@presentation/instituitions/dto/find-all.intituition';

@Injectable()
export class FindAllInstituitionUseCase {
  constructor(private readonly institutionSQL: InstitutionSQLRepository) {}
  async execute(input: ListInstituitionQueryDto): Promise<{
    institutions: Institution[];
    total: number;
    totalPages: number;
  }> {
    return await this.institutionSQL.findAllPaginated(input.page, input.limit, {
      contractNumber: input.search,
    });
  }
}
