import { UserSQLRepository } from '@infrastructure/data/sql/repositories/user.repository';
import { InstitutionSQLRepository } from '@infrastructure/data/sql/repositories/institution.repository';
import {
  BadRequestException,
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@infrastructure/data/sql/entities';

import { UpdateUserV2InputDto } from '@presentation/user/dto/update-user.dto';
import { UpdateUserV2Adapter } from '@application/user/adapters/update';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UpdateUserV2UseCase {
  constructor(
    private readonly userRepository: UserSQLRepository,
    private readonly institutionRepository: InstitutionSQLRepository,
  ) {}

  async execute(userId: string, input: UpdateUserV2InputDto): Promise<User> {
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new NotFoundException('Usuário não encontrado');
    }
    const institution = await this.institutionRepository.findById(
      input.institutionId,
    );
    if (!institution) {
      throw new BadRequestException('Instituição não encontrada');
    }
    const existingUserByEmail = await this.userRepository.findByEmail(
      input.email,
    );
    if (existingUserByEmail && existingUserByEmail.id !== userId) {
      throw new ConflictException('Email já está em uso por outro usuário');
    }
    const existingUserByIdentifier = await this.userRepository.findByIdentifier(
      input.identifier,
    );
    if (existingUserByIdentifier && existingUserByIdentifier.id !== userId) {
      throw new ConflictException(
        'Identificador já está em uso por outro usuário',
      );
    }
    let passwordHash: string | undefined;
    if (input.password) {
      const salt = await bcrypt.genSalt();
      passwordHash = await bcrypt.hash(input.password, salt); //TODO colocar service
    }
    const updateData = UpdateUserV2Adapter.toEntity(
      input,
      institution,
      passwordHash,
    );
    const updatedUser = await this.userRepository.updateUser(
      userId,
      updateData,
    );
    if (!updatedUser) {
      throw new BadRequestException('Erro ao atualizar usuário');
    }

    return updatedUser;
  }
}
