import { Injectable, NotFoundException } from '@nestjs/common';
import { UserEventPhotoSQLRepository } from '@infrastructure/data/sql/repositories/user-event-photo.repository';

@Injectable()
export class DeleteUserEventPhotoUseCase {
  constructor(
    private readonly userEventPhotoRepository: UserEventPhotoSQLRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const photo = await this.userEventPhotoRepository.findById(id);
    if (!photo) {
      throw new NotFoundException('Foto não encontrada');
    }

    await this.userEventPhotoRepository.deleteById(id);
  }
}
