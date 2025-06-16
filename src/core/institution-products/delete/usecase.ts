import { Injectable, NotFoundException } from '@nestjs/common';
import { InstitutionProductSQLRepository } from '@infrastructure/data/sql/repositories/institution-product.repostitoy';

@Injectable()
export class DeleteInstitutionProductUseCase {
  constructor(
    private readonly institutionProductRepository: InstitutionProductSQLRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existingRelation = await this.institutionProductRepository.findById(
      id,
    );

    if (!existingRelation) {
      throw new NotFoundException(
        `Relação produto-instituição com id "${id}" não encontrada`,
      );
    }

    await this.institutionProductRepository.deleteInstitutionProduct(id);
  }
}
