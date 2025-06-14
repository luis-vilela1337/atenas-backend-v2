import { UpdateInstituitionUseCase } from '@core/insituition/update.usecase';
import { Injectable } from '@nestjs/common';
import { InstitutionResponseDto } from '@presentation/instituitions/dto/find-by-id.insituition';
import { UpdateInstituitionDto } from '@presentation/instituitions/dto/update.instituition';

@Injectable()
export class UpdateInstitutionApplication {
  constructor(private readonly updateUseCase: UpdateInstituitionUseCase) {}

  async execute(
    id: string,
    input: UpdateInstituitionDto,
  ): Promise<InstitutionResponseDto> {
    try {
      const inst = await this.updateUseCase.execute(id, input);
      return InstitutionResponseDto.adapterToResponse(inst);
    } catch (e) {
      throw e;
    }
  }
}
