import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import { User } from '@infrastructure/data/sql/entities/user.entity';
import { UserSQLRepository } from '@infrastructure/data/sql/repositories/user.repository';
import { ImageStorageService } from '@infrastructure/services/image-storage.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepo: UserSQLRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly imageStorageService: ImageStorageService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'passwordHash'> | null> {
    try {
      const user = await this.usersRepo.findByEmail(email);
      if (user && (await bcrypt.compare(password, user.passwordHash))) {
        const { passwordHash, ...safe } = user;

        if (safe.profileImage) {
          safe.profileImage = await this.imageStorageService.generateSignedUrl(
            safe.profileImage,
            'read',
          );
        }

        return safe;
      }
      return null;
    } catch (error) {
      console.log(error);
    }
  }

  async login(user: Omit<User, 'passwordHash'>) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    // Access Token (15 min)
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    // Refresh Token (7 days) - DIFFERENT SECRET
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        this.configService.get<string>('JWT_SECRET') + '_refresh',
      expiresIn: '7d',
    });

    // Store hashed refresh token
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersRepo.setCurrentRefreshToken(hashedRefreshToken, user.id);

    // Note: user already has presigned URL from validateUser
    return { accessToken, refreshToken, user };
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.usersRepo.findById(userId);
    if (!user || !user.currentHashedRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const { passwordHash, currentHashedRefreshToken, ...safeUser } = user;

    if (safeUser.profileImage) {
      safeUser.profileImage = await this.imageStorageService.generateSignedUrl(
        safeUser.profileImage,
        'read',
      );
    }

    return {
      token: accessToken,
      user: safeUser,
    };
  }
  async logout(userId: string) {
    await this.usersRepo.removeRefreshToken(userId);
  }

  async validateRefreshToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          this.configService.get<string>('JWT_SECRET') + '_refresh',
      });
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
