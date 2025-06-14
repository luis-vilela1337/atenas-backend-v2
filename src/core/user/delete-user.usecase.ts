import { UserSQLRepository } from '@infrastructure/data/sql/repositories/user.repository';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class DeleteUserByIDV2UseCase {
  constructor(private readonly userRepository: UserSQLRepository) {}

  async execute(id: string): Promise<void> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (existingUser.status === 'inactive') {
      throw new BadRequestException('Usuário já está inativo');
    }

    const deletedUser = await this.userRepository.hardDelete(id);

    if (deletedUser < 0) {
      throw new BadRequestException('Erro ao excluir usuário');
    }
  }
}
