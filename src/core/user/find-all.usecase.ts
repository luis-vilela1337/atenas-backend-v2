import { UserSQLRepository } from '@infrastructure/data/sql/repositories/user.repository';
import { Injectable } from '@nestjs/common';
import { ListUsersQueryDto } from '@presentation/user/dto/list-users-query.dto';
import { PaginatedUsersEntity } from './dto/paginated.user.dto';
import { User, UserRole, UserStatus } from '@infrastructure/data/sql/entities';
import { ImageStorageService } from '@infrastructure/services/image-storage.service';

@Injectable()
export class FindAllUserUseCase {
  constructor(
    private readonly userRepository: UserSQLRepository,
    private readonly imageStorageService: ImageStorageService,
  ) {}

  async execute(input: ListUsersQueryDto): Promise<PaginatedUsersEntity> {
    const {
      page = 1,
      limit = 10,
      search,
      institutionId,
      role,
      status,
      sortBy,
      order = 'desc',
    } = input;

    if (search) {
      return await this.searchUsersWithFilters(input);
    }

    const filters: any = {};

    if (role) {
      filters.role = role as UserRole;
    }

    if (status) {
      filters.status = status as UserStatus;
    }

    if (institutionId) {
      filters.institutionId = institutionId;
    }

    const result = await this.userRepository.findAllPaginated(
      page,
      limit,
      filters,
    );

    if (sortBy && result.users.length > 0) {
      result.users = this.sortUsers(result.users, sortBy, order as 'asc' | 'desc');
    }
    await Promise.all(
      result.users.map(async (user) => {
        if (user.profileImage) {
          user.profileImage = await this.imageStorageService.generateSignedUrl(
            user.profileImage,'read'
          );
        }
      })
    );
    return new PaginatedUsersEntity({
      users: result.users,
      total: result.total,
      totalPages: result.totalPages,
      currentPage: page,
      limit,
    });
  }

  private async searchUsersWithFilters(
    input: ListUsersQueryDto,
  ): Promise<PaginatedUsersEntity> {
    const {
      page = 1,
      limit = 10,
      search,
      institutionId,
      role,
      status,
      sortBy,
      order = 'desc',
    } = input;

    let users = await this.userRepository.searchByContractNumber(
      search as string,
    );

    if (role) {
      users = users.filter((user) => user.role === role);
    }

    if (status) {
      users = users.filter((user) => user.status === status);
    }

    if (institutionId) {
      users = users.filter((user) => user.institution?.id === institutionId);
    }

    if (sortBy) {
      users = this.sortUsers(users, sortBy, order as 'asc' | 'desc');
    }

    const total = users.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const paginatedUsers = users.slice(skip, skip + limit);

    for (const user of paginatedUsers) {
      if (user.profileImage) {
        user.profileImage = await this.imageStorageService.generateSignedUrl(
          user.profileImage, 'read'
        );
      }
    }
    return new PaginatedUsersEntity({
      users: paginatedUsers,
      total,
      totalPages,
      currentPage: page,
      limit,
    });
  }

  private sortUsers(
    users: User[],
    sortBy: string,
    order: 'asc' | 'desc',
  ): User[] {
    return [...users].sort((a, b) => {
      let aValue = this.getNestedValue(a, sortBy);
      let bValue = this.getNestedValue(b, sortBy);

      if (aValue !== null && aValue !== undefined) {
        aValue = String(aValue).toLowerCase();
      }
      if (bValue !== null && bValue !== undefined) {
        bValue = String(bValue).toLowerCase();
      }

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => {
      return current && current[prop] !== undefined ? current[prop] : null;
    }, obj);
  }
}
