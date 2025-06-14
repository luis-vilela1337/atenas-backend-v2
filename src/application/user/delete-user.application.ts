import { Injectable } from '@nestjs/common';
import { DeleteUserAdapter } from './adapters/delete';
import { DeleteUserResponseDto } from '@presentation/user/dto/delete-user.dto';
import { DeleteUserByIDV2UseCase } from '@core/user/delete-user.usecase';

@Injectable()
export class DeleteUserV2Application {
  constructor(private readonly users: DeleteUserByIDV2UseCase) {}

  async execute(input: string): Promise<DeleteUserResponseDto> {
    try {
      await this.users.execute(input);
      return DeleteUserAdapter.toResponseDto(
        true,
        'Usuário excluído com sucesso',
      );
    } catch (e) {
      throw e;
    }
  }
}
