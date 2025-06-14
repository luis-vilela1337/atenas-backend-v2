import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { User } from '@infrastructure/data/sql/entities/user.entity';
import { UserSQLRepository } from '@infrastructure/data/sql/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepo: UserSQLRepository,
    private readonly jwtService: JwtService,
    @Inject('JWT_REFRESH_SERVICE')
    private readonly jwtRefreshService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'passwordHash'> | null> {
    try {
      const user = await this.usersRepo.findByEmail(email);
      if (user && (await bcrypt.compare(password, user.passwordHash))) {
        const { passwordHash, ...safe } = user;
        return safe;
      }
      return null;
    } catch (error) {
      console.log(error);
    }
  }

  async login(user: Omit<User, 'passwordHash'>) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);
    // const refreshToken = await this.jwtRefreshService.signAsync(payload);
    // await this.usersRepo.setCurrentRefreshToken(refreshToken, user.id);
    return { accessToken, user };
  }

  async refresh(user: { userId: string; email: string; role: string }) {
    const payload = { sub: user.userId, email: user.email, role: user.role };
    // return { token: await this.jwtService.createTokenV2(payload) };
  }
}
