import { UserSQLRepository } from '@infrastructure/data/sql/repositories/user.repository';
import {
  BadRequestException,
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@infrastructure/data/sql/entities';
import { UpdateProfileInputDto } from '@presentation/profile/dto/update-profile.dto';
import { ImageStorageService } from '@infrastructure/services/image-storage.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    private readonly userRepository: UserSQLRepository,
    private readonly imageStorageService: ImageStorageService,
  ) {}

  async execute(userId: string, input: UpdateProfileInputDto): Promise<User> {
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (input.email && input.email !== existingUser.email) {
      const emailExists = await this.userRepository.emailExists(
        input.email,
        userId,
      );
      if (emailExists) {
        throw new ConflictException('Email já está em uso por outro usuário');
      }
    }

    let passwordHash: string | undefined;
    if (input.password) {
      const salt = await bcrypt.genSalt();
      passwordHash = await bcrypt.hash(input.password, salt);
    }

    let processedProfileImage: string | undefined;
    if (input.profileImage) {
      processedProfileImage = this.imageStorageService.processProfileImageInput(
        input.profileImage,
      );
    }

    const updateData: Partial<User> = {};

    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.email !== undefined) {
      updateData.email = input.email;
    }
    if (input.phone !== undefined) {
      updateData.phone = input.phone;
    }
    if (passwordHash) {
      updateData.passwordHash = passwordHash;
    }
    if (processedProfileImage !== undefined) {
      updateData.profileImage = processedProfileImage;
    }

    if (input.address) {
      if (input.address.zipCode !== undefined) {
        updateData.zipCode = input.address.zipCode;
      }
      if (input.address.street !== undefined) {
        updateData.street = input.address.street;
      }
      if (input.address.number !== undefined) {
        updateData.number = input.address.number;
      }
      if (input.address.complement !== undefined) {
        updateData.complement = input.address.complement;
      }
      if (input.address.neighborhood !== undefined) {
        updateData.neighborhood = input.address.neighborhood;
      }
      if (input.address.city !== undefined) {
        updateData.city = input.address.city;
      }
      if (input.address.state !== undefined) {
        updateData.state = input.address.state;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return existingUser;
    }

    const updatedUser = await this.userRepository.updateUser(
      userId,
      updateData,
    );
    if (!updatedUser) {
      throw new BadRequestException('Erro ao atualizar perfil');
    }

    return updatedUser;
  }
}
