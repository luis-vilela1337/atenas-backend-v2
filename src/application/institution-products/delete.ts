import { Injectable } from '@nestjs/common';
import { DeleteInstitutionProductUseCase } from '@core/institution-products/delete/usecase';

@Injectable()
export class DeleteInstitutionProductApplication {
  constructor(
    private readonly deleteInstitutionProductUseCase: DeleteInstitutionProductUseCase,
  ) {}

  async execute(id: string): Promise<void> {
    try {
      return await this.deleteInstitutionProductUseCase.execute(id);
    } catch (e) {
      throw e;
    }
  }
}
