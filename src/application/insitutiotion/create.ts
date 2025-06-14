import { Injectable } from '@nestjs/common';
import { InstitutionResponseDto } from '@presentation/instituitions/dto/find-by-id.insituition';
import { CreateInstituitionDto } from '@presentation/instituitions/dto/create.instituition';
import { CreateInstituitionUseCase } from '@core/insituition/create.usecase';

@Injectable()
export class CreateInstitutionApplication {
  constructor(private readonly createUseCase: CreateInstituitionUseCase) {}

  async execute(input: CreateInstituitionDto): Promise<InstitutionResponseDto> {
    try {
      const inst = await this.createUseCase.execute(input);
      return InstitutionResponseDto.adapterToResponse(inst);
    } catch (error) {
      throw error;
    }
  }
}
