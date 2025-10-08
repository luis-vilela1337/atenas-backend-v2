import { DataSource, Repository } from 'typeorm';
import { Institution, InstitutionEvent } from '../entities';
import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { UpdateInstitutionData } from '../types/insituition.type';

@Injectable()
export class InstitutionSQLRepository {
  constructor(
    @InjectRepository(Institution)
    private readonly institution: Repository<Institution>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createInstitution(
    institutionData: Partial<Institution>,
  ): Promise<Institution> {
    const institution = this.institution.create(institutionData);
    return await this.institution.save(institution);
  }

  async findById(id: string): Promise<Institution | null> {
    return await this.institution.findOne({
      where: { id },
      relations: ['users', 'events'],
    });
  }

  async findAllPaginated(
    page = 1,
    limit = 10,
    filters?: { contractNumber?: string },
  ): Promise<{
    institutions: Institution[];
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const queryBuilder = this.institution
      .createQueryBuilder('institution')
      .leftJoinAndSelect('institution.users', 'user')
      .leftJoinAndSelect('institution.events', 'institution_events')
      .skip(skip)
      .take(limit);

    if (filters?.contractNumber) {
      queryBuilder.andWhere(
        '(institution.contractNumber ILIKE :search OR institution.name ILIKE :search)',
        { search: `%${filters.contractNumber}%` },
      );
    }

    queryBuilder.loadRelationCountAndMap(
      'institution.userCount',
      'institution.users',
    );

    queryBuilder.orderBy('institution.updatedAt', 'DESC');

    const [institutions, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      institutions,
      total,
      totalPages,
    };
  }

  async updateInstitution(
    id: string,
    updateData: UpdateInstitutionData,
  ): Promise<Institution | null> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const inst = await qr.manager
        .createQueryBuilder(Institution, 'inst')
        .leftJoinAndSelect('inst.events', 'events')
        .where('inst.id = :id', { id })
        .getOne();

      if (!inst) {
        await qr.rollbackTransaction();
        return null;
      }

      if (updateData.events?.length) {
        const existingEventIds = new Set(inst.events.map((e) => e.id));
        const providedEventIds = new Set(
          updateData.events.filter((e) => e.id).map((e) => e.id),
        );

        const eventsToDelete = inst.events.filter(
          (e) => !providedEventIds.has(e.id),
        );
        if (eventsToDelete.length > 0) {
          await qr.manager.softDelete(
            InstitutionEvent,
            eventsToDelete.map((e) => e.id),
          );
        }

        const toUpsert = updateData.events.map((dto) => {
          if (dto.id && existingEventIds.has(dto.id)) {
            const ev = inst.events.find((e) => e.id === dto.id);
            ev.name = dto.name;
            return ev;
          } else {
            const ev = new InstitutionEvent();
            ev.name = dto.name;
            ev.institution = inst as Institution;
            return ev;
          }
        });
        await qr.manager.save(toUpsert);
      } else {
        await qr.manager.softDelete(InstitutionEvent, { institution: inst });
      }

      const { contractNumber, name, observations } = updateData;
      await qr.manager.update(Institution, id, {
        contractNumber,
        name,
        observations,
      });

      await qr.commitTransaction();
      return this.institution.findOne({
        where: { id },
        relations: ['events', 'users'],
      });
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async hardDelete(id: string): Promise<void> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const inst = await qr.manager.findOne(Institution, {
        where: { id },
        relations: ['events'],
      });
      if (!inst) {
        await qr.rollbackTransaction();
        return null;
      }

      await qr.manager.softDelete(InstitutionEvent, { institution: { id } });
      await qr.manager.delete(Institution, id);

      await qr.commitTransaction();
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async getInstitutionWithUsersAndEvents(
    id: string,
  ): Promise<Institution | null> {
    return await this.institution.findOne({
      where: { id },
      relations: ['users', 'events'],
    });
  }
}
