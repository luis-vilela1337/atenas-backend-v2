import { Injectable } from '@nestjs/common';
import { UserEventPhotoSQLRepository } from '@infrastructure/data/sql/repositories/user-event-photo.repository';
import { UserEventPhoto } from '@infrastructure/data/sql/entities/user-event-photo.entity';

@Injectable()
export class FindUserEventPhotosByUserUseCase {
  constructor(
    private readonly userEventPhotoRepository: UserEventPhotoSQLRepository,
  ) {}

  async execute(userId: string): Promise<UserEventPhoto[]> {
    return await this.userEventPhotoRepository.findByUser(userId);
  }
}