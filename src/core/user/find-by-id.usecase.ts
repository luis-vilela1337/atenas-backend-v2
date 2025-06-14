import { UserSQLRepository } from '@infrastructure/data/sql/repositories/user.repository';
import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@infrastructure/data/sql/entities';

@Injectable()
export class FindUserByIDV2UseCase {
  constructor(private readonly userRepository: UserSQLRepository) {}

  async execute(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new BadRequestException('Usuario nao encontrado');
    }

    return user;
  }
}
