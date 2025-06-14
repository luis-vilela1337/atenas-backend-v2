import { FindAllInstituitionUseCase } from '@core/insituition/find-all.usecase';
import { Injectable } from '@nestjs/common';
import {
  ListInstituitionQueryDto,
  ListInstitutionsResponseDto,
} from '@presentation/instituitions/dto/find-all.intituition';

@Injectable()
export class FindAllInstitutionApplication {
  constructor(
    private readonly findAllInstituitionUseCase: FindAllInstituitionUseCase,
  ) {}
  async execute(
    input: ListInstituitionQueryDto,
  ): Promise<ListInstitutionsResponseDto> {
    try {
      const response = await this.findAllInstituitionUseCase.execute(input);
      return ListInstitutionsResponseDto.adapterToResponse(
        response.institutions,
        {
          limit: input.limit,
          page: input.page,
          total: response.total,
          totalPages: response.totalPages,
        },
      );
      return;
    } catch (error) {
      throw new Error(error);
    }
  }
}
