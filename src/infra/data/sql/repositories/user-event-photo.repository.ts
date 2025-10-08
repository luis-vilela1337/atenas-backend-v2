import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEventPhoto } from '@infrastructure/data/sql/entities/user-event-photo.entity';

@Injectable()
export class UserEventPhotoSQLRepository {
  constructor(
    @InjectRepository(UserEventPhoto)
    private readonly repository: Repository<UserEventPhoto>,
  ) {}

  async create(
    userEventPhoto: Partial<UserEventPhoto>,
  ): Promise<UserEventPhoto> {
    const entity = this.repository.create(userEventPhoto);
    return await this.repository.save(entity);
  }

  async findByUser(userId: string): Promise<UserEventPhoto[]> {
    return await this.repository.find({
      where: { user: { id: userId } },
      relations: ['user', 'event'],
    });
  }

  async findByUserAndEvent(
    userId: string,
    eventId: string,
  ): Promise<UserEventPhoto[]> {
    return await this.repository.find({
      where: {
        user: { id: userId },
        event: { id: eventId },
      },
      relations: ['user', 'event'],
    });
  }

  async findByEvent(eventId: string): Promise<UserEventPhoto[]> {
    return await this.repository.find({
      where: { event: { id: eventId } },
      relations: ['user', 'event'],
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async findById(id: string): Promise<UserEventPhoto | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['user', 'event'],
    });
  }
}
