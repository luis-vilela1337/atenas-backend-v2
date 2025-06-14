import { DeleteUserResponseDto } from '@presentation/user/dto/delete-user.dto';

export class DeleteUserAdapter {
  static toResponseDto(
    success: boolean,
    message?: string,
  ): DeleteUserResponseDto {
    return {
      success,
      message:
        message ||
        (success ? 'Usuário excluído com sucesso' : 'Erro ao excluir usuário'),
    };
  }
}
