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
    sortBy?: string,
    order: 'asc' | 'desc' = 'desc',
  ): Promise<{ users: User[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const queryBuilder = this.user
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.institution', 'institution');

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

    // Map sortBy to database columns
    const columnMap: Record<string, string> = {
      name: 'user.name',
      email: 'user.email',
      role: 'user.role',
      status: 'user.status',
      createdAt: 'user.createdAt',
      updatedAt: 'user.updatedAt',
      lastLoginAt: 'user.lastLoginAt',
    };

    const sortOrder = order.toUpperCase() as 'ASC' | 'DESC';

    if (sortBy === 'userContract') {
      // Sort by computed field: contractNumber-identifier
      queryBuilder.orderBy(
        `CONCAT(institution."contractNumber", '-', "user"."identifier")`,
        sortOrder,
      );
    } else {
      const sortColumn = (sortBy && columnMap[sortBy]) || 'user.updatedAt';
      queryBuilder.orderBy(sortColumn, sortOrder);
    }

    queryBuilder.skip(skip).take(limit);

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
    const queryBuilder = this.user
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.institution', 'institution');

    if (searchTerm.includes('-')) {
      const [contractNumber, identifier] = searchTerm.split('-', 2);
      queryBuilder.where(
        `(institution.contractNumber = :contractNumber AND user.identifier = :identifier)
         OR institution.contractNumber ILIKE :search
         OR user.identifier ILIKE :search
         OR user.name ILIKE :search
         OR user.email ILIKE :search
         OR CONCAT(institution.contractNumber, '-', user.identifier) ILIKE :search`,
        {
          contractNumber: contractNumber.trim(),
          identifier: identifier.trim(),
          search: `%${searchTerm}%`,
        },
      );
    } else {
      queryBuilder.where(
        `institution.contractNumber ILIKE :search
         OR user.identifier ILIKE :search
         OR user.name ILIKE :search
         OR user.email ILIKE :search
         OR CONCAT(institution.contractNumber, '-', user.identifier) ILIKE :search`,
        {
          search: `%${searchTerm}%`,
        },
      );
    }

    return await queryBuilder.orderBy('user.updatedAt', 'DESC').getMany();
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
    institutionId: string,
    excludeId?: string,
  ): Promise<boolean> {
    const queryBuilder = this.user
      .createQueryBuilder('user')
      .where('user.identifier = :identifier', { identifier })
      .andWhere('user.institution.id = :institutionId', { institutionId });

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

  async findActiveClientsByInstitutionId(
    institutionId: string,
  ): Promise<User[]> {
    return await this.user.find({
      where: {
        institution: { id: institutionId },
        role: 'client',
        status: 'active',
      },
      relations: ['institution'],
      order: { name: 'ASC' },
    });
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

  async findUserCreditByUserId(userId: string): Promise<number> {
    const user = await this.user.findOne({
      where: { id: userId },
      select: ['creditValue'],
    });
    return user?.creditValue ? parseFloat(user.creditValue) : 0;
  }

  async updateUserCredit(userId: string, newValue: number): Promise<void> {
    await this.user.update(userId, { creditValue: newValue.toString() });
  }

  async deductCreditAtomic(
    userId: string,
    amount: number,
  ): Promise<{ success: boolean; previousCredit: number; newCredit: number }> {
    const result = await this.user.manager.query(
      `UPDATE users
       SET "creditValue" = COALESCE("creditValue"::numeric, 0) - $1
       WHERE id = $2 AND COALESCE("creditValue"::numeric, 0) >= $1
       RETURNING COALESCE("creditValue"::numeric, 0) + $1 as previous_credit, COALESCE("creditValue"::numeric, 0) as new_credit`,
      [amount, userId],
    );

    if (result.length === 0) {
      const current = await this.findUserCreditByUserId(userId);
      return { success: false, previousCredit: current, newCredit: current };
    }

    return {
      success: true,
      previousCredit: parseFloat(result[0].previous_credit),
      newCredit: parseFloat(result[0].new_credit),
    };
  }

  async addCredit(userId: string, amount: number): Promise<void> {
    await this.user.manager.query(
      `UPDATE users
       SET "creditValue" = COALESCE("creditValue"::numeric, 0) + $1
       WHERE id = $2`,
      [amount, userId],
    );
  }

  /**
   * Reserva (bloqueia) crédito para um pedido pendente
   * Move crédito de creditValue para creditReserved
   */
  async reserveCredit(
    userId: string,
    amount: number,
  ): Promise<{
    success: boolean;
    availableCredit: number;
    reservedCredit: number;
  }> {
    const result = await this.user.manager.query(
      `UPDATE users
       SET "creditValue" = COALESCE("creditValue"::numeric, 0) - $1,
           "creditReserved" = COALESCE("creditReserved"::numeric, 0) + $1
       WHERE id = $2 
       AND COALESCE("creditValue"::numeric, 0) >= $1
       RETURNING 
         COALESCE("creditValue"::numeric, 0) as available_credit,
         COALESCE("creditReserved"::numeric, 0) as reserved_credit`,
      [amount, userId],
    );

    if (result.length === 0) {
      const user = await this.user.findOne({
        where: { id: userId },
        select: ['creditValue', 'creditReserved'],
      });
      return {
        success: false,
        availableCredit: user?.creditValue ? parseFloat(user.creditValue) : 0,
        reservedCredit: user?.creditReserved
          ? parseFloat(user.creditReserved)
          : 0,
      };
    }

    return {
      success: true,
      availableCredit: parseFloat(result[0].available_credit),
      reservedCredit: parseFloat(result[0].reserved_credit),
    };
  }

  /**
   * Libera crédito reservado de volta para disponível
   * Usado quando pedido é cancelado/rejeitado/expirado
   */
  async releaseReservedCredit(userId: string, amount: number): Promise<void> {
    await this.user.manager.query(
      `UPDATE users
       SET "creditValue" = COALESCE("creditValue"::numeric, 0) + $1,
           "creditReserved" = COALESCE("creditReserved"::numeric, 0) - $1
       WHERE id = $2
       AND COALESCE("creditReserved"::numeric, 0) >= $1`,
      [amount, userId],
    );
  }

  /**
   * Consome crédito reservado definitivamente
   * Usado quando pedido é aprovado (remove do reservado sem devolver)
   */
  async consumeReservedCredit(userId: string, amount: number): Promise<void> {
    await this.user.manager.query(
      `UPDATE users
       SET "creditReserved" = COALESCE("creditReserved"::numeric, 0) - $1
       WHERE id = $2
       AND COALESCE("creditReserved"::numeric, 0) >= $1`,
      [amount, userId],
    );
  }
}
