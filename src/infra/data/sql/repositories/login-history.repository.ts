import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginHistory } from '../entities/login-history.entity';

@Injectable()
export class LoginHistoryRepository {
  constructor(
    @InjectRepository(LoginHistory)
    private readonly loginHistory: Repository<LoginHistory>,
  ) {}

  async create(data: {
    userId: string;
    loginAt: Date;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    failureReason?: string;
  }): Promise<LoginHistory> {
    const entry = this.loginHistory.create(data);
    return await this.loginHistory.save(entry);
  }

  async findByUserId(userId: string): Promise<LoginHistory[]> {
    return await this.loginHistory.find({
      where: { userId },
      order: { loginAt: 'DESC' },
    });
  }

  async findByUserIdPaginated(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{ records: LoginHistory[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [records, total] = await this.loginHistory.findAndCount({
      where: { userId },
      order: { loginAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      records,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async hasUserEverLoggedIn(userId: string): Promise<boolean> {
    const count = await this.loginHistory.count({
      where: { userId, success: true },
    });
    return count > 0;
  }

  async getLastSuccessfulLogin(userId: string): Promise<LoginHistory | null> {
    return await this.loginHistory.findOne({
      where: { userId, success: true },
      order: { loginAt: 'DESC' },
    });
  }

  async getUserIdsWithSuccessfulLogin(userIds: string[]): Promise<string[]> {
    if (userIds.length === 0) return [];

    const result = await this.loginHistory
      .createQueryBuilder('lh')
      .select('DISTINCT lh.user_id', 'userId')
      .where('lh.user_id IN (:...userIds)', { userIds })
      .andWhere('lh.success = true')
      .getRawMany();

    return result.map((r) => r.userId);
  }

  async countByUserId(userId: string): Promise<number> {
    return await this.loginHistory.count({ where: { userId } });
  }

  async countSuccessfulByUserId(userId: string): Promise<number> {
    return await this.loginHistory.count({ where: { userId, success: true } });
  }

  async countFailedByUserId(userId: string): Promise<number> {
    return await this.loginHistory.count({ where: { userId, success: false } });
  }

  async deleteByUserId(userId: string): Promise<number> {
    const result = await this.loginHistory.delete({ userId });
    return result.affected || 0;
  }
}
