import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserEventPhotoSQLRepository } from '@infrastructure/data/sql/repositories/user-event-photo.repository';
import { UserSQLRepository } from '@infrastructure/data/sql/repositories/user.repository';
import { UserEventPhoto } from '@infrastructure/data/sql/entities/user-event-photo.entity';
import { InstitutionEventSQLRepository } from '@infrastructure/data/sql/repositories/institution-event.repository';

export interface CreateUserEventPhotoInput {
  userId: string;
  eventId: string;
  fileNames: string[];
}

@Injectable()
export class CreateUserEventPhotoUseCase {
  constructor(
    private readonly userEventPhotoRepository: UserEventPhotoSQLRepository,
    private readonly userRepository: UserSQLRepository,
    private readonly eventRepository: InstitutionEventSQLRepository,
  ) {}

  async execute(input: CreateUserEventPhotoInput): Promise<UserEventPhoto[]> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    const event = await this.eventRepository.findById(input.eventId);
    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }

    if (user.institution.id !== event.institution.id) {
      throw new BadRequestException('Usuário não pertence à instituição do evento');
    }

    const createdPhotos: UserEventPhoto[] = [];
    for (const fileName of input.fileNames) {
      const photo = await this.userEventPhotoRepository.create({
        user,
        event,
        fileName,
      });
      createdPhotos.push(photo);
    }

    return createdPhotos;
  }
}