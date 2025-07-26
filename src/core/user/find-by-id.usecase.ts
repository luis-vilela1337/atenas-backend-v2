import { UserSQLRepository } from '@infrastructure/data/sql/repositories/user.repository';
import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@infrastructure/data/sql/entities';
import { ImageStorageService } from '@infrastructure/services/image-storage.service';

@Injectable()
export class FindUserByIDV2UseCase {
  constructor(
    private readonly userRepository: UserSQLRepository,
    private readonly imageStorageService: ImageStorageService,
  ) {}

  async execute(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new BadRequestException('Usuario nao encontrado');
    }

    if (user.profileImage) {
      user.profileImage = await this.imageStorageService.generateSignedUrl(
        user.profileImage,
        'read',
      );
    }

    return user;
  }
}
