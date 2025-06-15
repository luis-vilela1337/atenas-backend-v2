import { Injectable } from '@nestjs/common';
import { FindInstitutionProductByIdUseCase } from '@core/institution-products/find-by-id/usecase';
import { InstitutionProductDto } from '@presentation/institution-product/dto/dto';
import { InstitutionProductMapper } from '@application/institution-products/adapters/adapter';

@Injectable()
export class FindInstitutionProductByIdApplication {
  constructor(
    private readonly findInstitutionProductByIdUseCase: FindInstitutionProductByIdUseCase,
  ) {}

  async execute(id: string): Promise<InstitutionProductDto> {
    try {
      const institutionProduct =
        await this.findInstitutionProductByIdUseCase.execute(id);
      return InstitutionProductMapper.toDto(institutionProduct);
    } catch (error) {
      throw error;
    }
  }
}
