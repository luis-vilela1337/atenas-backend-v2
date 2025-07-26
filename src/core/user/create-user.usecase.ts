import { UserSQLRepository } from '@infrastructure/data/sql/repositories/user.repository';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { User } from '@infrastructure/data/sql/entities';
import { CreateUserV2InputDto } from '@presentation/user/dto/create-user.dto';
import { InstitutionSQLRepository } from '@infrastructure/data/sql/repositories/institution.repository';
import { CreateUserAdapter } from '@application/user/adapters/create';
import { ImageStorageService } from '@infrastructure/services/image-storage.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CreateUserV2UseCase {
  constructor(
    private readonly userRepository: UserSQLRepository,
    private readonly institutionRepository: InstitutionSQLRepository,
    private readonly imageStorageService: ImageStorageService,
  ) {}

  async execute(input: CreateUserV2InputDto): Promise<User> {
    const institution = await this.institutionRepository.findById(
      input.institutionId,
    );
    if (!institution) {
      throw new BadRequestException('Instituição não encontrada');
    }

    const existingUserByEmail = await this.userRepository.findByEmail(
      input.email,
    );
    if (existingUserByEmail) {
      throw new ConflictException('Email já está em uso');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(input.password, salt); //TODO colocar service

    if (input.profileImage) {
      input.profileImage = this.imageStorageService.processProfileImageInput(
        input.profileImage,
      );
    }

    const userEntity = CreateUserAdapter.toEntity(
      input,
      institution,
      passwordHash,
    );

    const savedUser = await this.userRepository.createUser(userEntity);

    const fullUser = await this.userRepository.findById(savedUser.id);

    if (!fullUser) {
      throw new BadRequestException('Erro ao recuperar usuário criado');
    }

    return fullUser;
  }
}
