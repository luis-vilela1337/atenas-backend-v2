import { UserDto } from '@presentation/user/dto/user.dto';
import { PaginatedUsersDto as PresentationPaginatedDto } from '@presentation/user/dto/paginated-users.dto';
import { PaginationMetaDto } from '@presentation/user/dto/pagination-meta.dto';
import { User } from '@infrastructure/data/sql/entities';
import { PaginatedUsersEntity } from '@core/user/dto/paginated.user.dto';

export class UserMapper {
  static toDto(user: User): UserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      institutionId: user.institution?.id || user.institution.id,
      status: user.status,
      createdAt: user.createdAt,
      profileImage: user.profileImage || '',
      userContract: user.institution.contractNumber + user.identifier,
    };
  }

  static toDtoArray(users: User[]): UserDto[] {
    return users.map((user) => this.toDto(user));
  }

  static toPaginatedDto(
    useCaseResult: PaginatedUsersEntity,
  ): PresentationPaginatedDto {
    const paginationMeta: PaginationMetaDto = {
      total: useCaseResult.total,
      totalPages: useCaseResult.totalPages,
      page: useCaseResult.currentPage,
      limit: useCaseResult.limit,
    };

    return {
      data: this.toDtoArray(useCaseResult.users),
      pagination: paginationMeta,
    };
  }
}
