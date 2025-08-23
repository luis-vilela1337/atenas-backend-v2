import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserSQLRepository {
  constructor(
    @InjectRepository(User)
    private readonly user: Repository<User>,
  ) {}

  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.user.create(userData);
    return await this.user.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return await this.user.findOne({
      where: { id },
      relations: ['institution'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.user.findOne({
      where: { email },
      relations: ['institution'],
    });
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    return await this.user.findOne({
      where: { identifier },
      relations: ['institution'],
    });
  }
  async findAllPaginated(
    page = 1,
    limit = 10,
    filters?: {
      role?: UserRole;
      status?: UserStatus;
      institutionId?: string;
    },
  ): Promise<{ users: User[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const queryBuilder = this.user
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.institution', 'institution')
      .skip(skip)
      .take(limit);

    if (filters?.role) {
      queryBuilder.andWhere('user.role = :role', { role: filters.role });
    }

    if (filters?.status) {
      queryBuilder.andWhere('user.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.institutionId) {
      queryBuilder.andWhere('user.institution.id = :institutionId', {
        institutionId: filters.institutionId,
      });
    }

    queryBuilder.orderBy('user.updatedAt', 'DESC');

    const [users, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      users,
      total,
      totalPages,
    };
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return await this.user.find({
      where: { role },
      relations: ['institution'],
      // ADD THIS LINE:
      order: { updatedAt: 'DESC' },
    });
  }

  async findByStatus(status: UserStatus): Promise<User[]> {
    return await this.user.find({
      where: { status },
      relations: ['institution'],
      order: { updatedAt: 'DESC' },
    });
  }

  async updateUser(
    id: string,
    updateData: Partial<User>,
  ): Promise<User | null> {
    await this.user.update(id, updateData);
    return await this.findById(id);
  }

  async updateStatus(id: string, status: UserStatus): Promise<User | null> {
    await this.user.update(id, { status });
    return await this.findById(id);
  }

  async softDelete(id: string): Promise<User | null> {
    return await this.updateStatus(id, 'inactive');
  }

  async hardDelete(id: string): Promise<number> {
    return (await this.user.delete(id)).affected;
  }

  async countUsers(filters?: {
    role?: UserRole;
    status?: UserStatus;
    institutionId?: string;
  }): Promise<number> {
    const queryBuilder = this.user.createQueryBuilder('user');

    if (filters?.role) {
      queryBuilder.andWhere('user.role = :role', { role: filters.role });
    }

    if (filters?.status) {
      queryBuilder.andWhere('user.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.institutionId) {
      queryBuilder.andWhere('user.institution.id = :institutionId', {
        institutionId: filters.institutionId,
      });
    }

    return await queryBuilder.getCount();
  }
  async searchUsers(searchTerm: string): Promise<User[]> {
    return await this.user
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.institution', 'institution')
      .where(
        `institution.contractNumber ILIKE :search 
              OR user.identifier ILIKE :search 
              OR user.name ILIKE :search 
              OR user.email ILIKE :search`,
        {
          search: `%${searchTerm}%`,
        },
      )
      .orderBy('user.updatedAt', 'DESC')
      .getMany();
  }
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const queryBuilder = this.user
      .createQueryBuilder('user')
      .where('user.email = :email', { email });

    if (excludeId) {
      queryBuilder.andWhere('user.id != :excludeId', { excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }
  async identifierExists(
    identifier: string,
    excludeId?: string,
  ): Promise<boolean> {
    const queryBuilder = this.user
      .createQueryBuilder('user')
      .where('user.identifier = :identifier', { identifier });

    if (excludeId) {
      queryBuilder.andWhere('user.id != :excludeId', { excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }
  async findByDateRange(startDate: Date, endDate: Date): Promise<User[]> {
    return await this.user
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.institution', 'institution')
      .where('user.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('user.createdAt', 'DESC')
      .getMany();
  }

  async findActiveUsers(): Promise<User[]> {
    return await this.findByStatus('active');
  }

  async findInactiveUsers(): Promise<User[]> {
    return await this.findByStatus('inactive');
  }

  async findAdmins(): Promise<User[]> {
    return await this.findByRole('admin');
  }

  async findClients(): Promise<User[]> {
    return await this.findByRole('client');
  }

  private async hashRefreshToken(token: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(token, salt);
  }

  private async compareHash(token: string, hash: string): Promise<boolean> {
    return bcrypt.compare(token, hash);
  }

  async setCurrentRefreshToken(
    refreshToken: string,
    userId: string,
  ): Promise<void> {
    await this.user.update(userId, { currentHashedRefreshToken: refreshToken });
  }

  async removeRefreshToken(userId: string): Promise<void> {
    await this.user.update(userId, { currentHashedRefreshToken: null });
  }

  async getUserIfRefreshTokenMatches(
    refreshToken: string,
    userId: string,
  ): Promise<User | null> {
    const user = await this.user.findOne({
      where: { id: userId },
    });

    if (!user || !user.currentHashedRefreshToken) {
      return null;
    }

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );

    return isRefreshTokenMatching ? user : null;
  }
}
