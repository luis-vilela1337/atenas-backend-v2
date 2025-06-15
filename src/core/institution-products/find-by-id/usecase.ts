import { Injectable, NotFoundException } from '@nestjs/common';
import { InstitutionProductSQLRepository } from '@infrastructure/data/sql/repositories/institution-product.repostitoy';
import { InstitutionProduct } from '@infrastructure/data/sql/entities';

@Injectable()
export class FindInstitutionProductByIdUseCase {
  constructor(
    private readonly institutionProductRepository: InstitutionProductSQLRepository,
  ) {}

  async execute(id: string): Promise<InstitutionProduct> {
    const institutionProduct = await this.institutionProductRepository.findById(
      id,
    );

    if (!institutionProduct) {
      throw new NotFoundException(
        `Institution product relation with ID ${id} not found`,
      );
    }

    return institutionProduct;
  }
}
