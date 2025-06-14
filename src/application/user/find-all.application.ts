import { FindAllUserUseCase } from '@core/user/find-all.usecase';
import { Injectable } from '@nestjs/common';
import { ListUsersQueryDto } from '@presentation/user/dto/list-users-query.dto';
import { PaginatedUsersDto } from '@presentation/user/dto/paginated-users.dto';
import { UserMapper } from './adapters/user.mapper.findAll';

@Injectable()
export class FindAllUserV2Application {
  constructor(private readonly users: FindAllUserUseCase) {}

  async execute(input: ListUsersQueryDto): Promise<PaginatedUsersDto> {
    try {
      const result = await this.users.execute(input);
      return UserMapper.toPaginatedDto(result);
    } catch (e) {
      throw e;
    }
  }
}
