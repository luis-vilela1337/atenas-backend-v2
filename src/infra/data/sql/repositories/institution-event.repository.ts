import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstitutionEvent } from '@infrastructure/data/sql/entities/instituition.events';

@Injectable()
export class InstitutionEventSQLRepository {
  constructor(
    @InjectRepository(InstitutionEvent)
    private readonly repository: Repository<InstitutionEvent>,
  ) {}

  async findById(id: string): Promise<InstitutionEvent | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['institution'],
    });
  }

  async findByInstitution(institutionId: string): Promise<InstitutionEvent[]> {
    return await this.repository.find({
      where: { institution: { id: institutionId } },
      relations: ['institution'],
    });
  }

  async create(
    eventData: Partial<InstitutionEvent>,
  ): Promise<InstitutionEvent> {
    const event = this.repository.create(eventData);
    return await this.repository.save(event);
  }

  async update(
    id: string,
    eventData: Partial<InstitutionEvent>,
  ): Promise<InstitutionEvent> {
    await this.repository.update(id, eventData);
    return await this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
