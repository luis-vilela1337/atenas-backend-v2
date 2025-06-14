import { FindByIdInstituitionUseCase } from '@core/insituition/find-by-id.usecase';
import { Injectable } from '@nestjs/common';
import { InstitutionResponseDto } from '@presentation/instituitions/dto/find-by-id.insituition';

@Injectable()
export class FindByIdInstitutionApplication {
  constructor(private readonly findByIdUseCase: FindByIdInstituitionUseCase) {}

  async execute(id: string): Promise<InstitutionResponseDto> {
    try {
      const inst = await this.findByIdUseCase.execute(id);
      return InstitutionResponseDto.adapterToResponse(inst);
    } catch (error) {
      throw error;
    }
  }
}
