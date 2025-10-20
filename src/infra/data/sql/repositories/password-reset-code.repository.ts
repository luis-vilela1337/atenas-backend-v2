import { Repository, LessThan } from 'typeorm';
import { PasswordResetCode } from '../entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class PasswordResetCodeRepository {
  constructor(
    @InjectRepository(PasswordResetCode)
    private readonly repository: Repository<PasswordResetCode>,
  ) {}

  async create(
    user: User,
    code: string,
    expiresAt: Date,
  ): Promise<PasswordResetCode> {
    const resetCode = this.repository.create({
      user,
      code,
      expiresAt,
      used: false,
    });
    return await this.repository.save(resetCode);
  }

  async findValidCode(
    userId: string,
    code: string,
  ): Promise<PasswordResetCode | null> {
    return await this.repository.findOne({
      where: {
        user: { id: userId },
        code,
        used: false,
      },
      relations: ['user'],
    });
  }

  async markAsUsed(id: string): Promise<void> {
    await this.repository.update(id, { used: true });
  }

  async invalidateUserCodes(userId: string): Promise<void> {
    await this.repository.update(
      { user: { id: userId }, used: false },
      { used: true },
    );
  }

  async deleteExpiredCodes(): Promise<void> {
    await this.repository.delete({
      expiresAt: LessThan(new Date()),
    });
  }
}
