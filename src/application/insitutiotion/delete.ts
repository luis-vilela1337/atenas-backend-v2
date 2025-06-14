import { DeleteInstituitionUseCase } from '@core/insituition/delete.usecase';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DeleteInstitutionApplication {
  constructor(private readonly deleteUseCase: DeleteInstituitionUseCase) {}

  async execute(id: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.deleteUseCase.execute(id);
      return { success: true, message: 'Instituição excluída com sucesso' };
    } catch (e) {
      throw e;
    }
  }
}
