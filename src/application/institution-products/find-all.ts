import { Injectable } from '@nestjs/common';
import { FindAllInstitutionProductsUseCase } from '@core/institution-products/find-all/usecase';
import {
  ListInstitutionProductsQueryDto,
  PaginatedInstitutionProductsDto,
} from '@presentation/institution-product/dto/list-all.dto';
import { InstitutionProductMapper } from './adapters/adapter';

@Injectable()
export class FindAllInstitutionProductsApplication {
  constructor(
    private readonly findAllInstitutionProductsUseCase: FindAllInstitutionProductsUseCase,
  ) {}

  async execute(
    input: ListInstitutionProductsQueryDto,
  ): Promise<PaginatedInstitutionProductsDto> {
    try {
      const useCaseResult =
        await this.findAllInstitutionProductsUseCase.execute(input);
      return InstitutionProductMapper.toPaginatedDto(useCaseResult);
    } catch (error) {
      throw error;
    }
  }
}
