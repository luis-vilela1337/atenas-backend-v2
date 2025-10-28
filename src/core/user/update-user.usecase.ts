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
import { ImageStorageService } from '@infrastructure/services/image-storage.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UpdateUserV2UseCase {
  constructor(
    private readonly userRepository: UserSQLRepository,
    private readonly institutionRepository: InstitutionSQLRepository,
    private readonly imageStorageService: ImageStorageService,
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
    const emailExists = await this.userRepository.emailExists(
      input.email,
      userId,
    );
    if (emailExists) {
      throw new ConflictException('Email já está em uso por outro usuário');
    }
    const identifierExists = await this.userRepository.identifierExists(
      input.identifier,
      input.institutionId,
      userId,
    );
    if (identifierExists) {
      throw new ConflictException(
        'Identificador já está em uso por outro usuário',
      );
    }
    let passwordHash: string | undefined;
    if (input.password) {
      const salt = await bcrypt.genSalt();
      passwordHash = await bcrypt.hash(input.password, salt); //TODO colocar service
    }

    if (input.profileImage) {
      input.profileImage = this.imageStorageService.processProfileImageInput(
        input.profileImage,
      );
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
