import { Injectable } from '@nestjs/common';
import {
  UpdateInstitutionProductInputDto,
  UpdateInstitutionProductResponseDto,
} from '@presentation/institution-product/dto/update.dto';
import { UpdateInstitutionProductAdapter } from './adapters/update.adapter';
import { UpdateInstitutionProductUseCase } from '@core/institution-products/update/usecase';

@Injectable()
export class UpdateInstitutionProductApplication {
  constructor(
    private readonly updateInstitutionProductUseCase: UpdateInstitutionProductUseCase,
  ) {}

  async execute(
    id: string,
    input: UpdateInstitutionProductInputDto,
  ): Promise<UpdateInstitutionProductResponseDto> {
    const updatedInstitutionProduct =
      await this.updateInstitutionProductUseCase.execute(id, input);

    return UpdateInstitutionProductAdapter.toResponseDto(
      updatedInstitutionProduct,
    );
  }
}
