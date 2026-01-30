import { DeleteEventUseCase } from '@core/insituition/delete-event.usecase';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DeleteEventApplication {
  constructor(private readonly deleteEventUseCase: DeleteEventUseCase) {}

  async execute(eventId: string): Promise<{ success: boolean; message: string }> {
    await this.deleteEventUseCase.execute(eventId);
    return { success: true, message: 'Evento excluído com sucesso' };
  }
}
