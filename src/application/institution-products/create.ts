import { Injectable } from '@nestjs/common';
import { CreateInstitutionProductUseCase } from '@core/institution-products/create/usecase';
import {
  CreateInstitutionProductInputDto,
  CreateInstitutionProductResponseDto,
} from '@presentation/institution-product/dto/create.dto';
import { CreateInstitutionProductAdapter } from '@application/institution-products/adapters/create.adapter';

@Injectable()
export class CreateInstitutionProductApplication {
  constructor(
    private readonly createInstitutionProductUseCase: CreateInstitutionProductUseCase,
  ) {}

  async execute(
    input: CreateInstitutionProductInputDto,
  ): Promise<CreateInstitutionProductResponseDto> {
    try {
      const institutionProduct =
        await this.createInstitutionProductUseCase.execute(input);
      return CreateInstitutionProductAdapter.toResponseDto(institutionProduct);
    } catch (error) {
      throw error;
    }
  }
}
