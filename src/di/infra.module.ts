import { entities } from '@infrastructure/data/sql/entities';
import { InstitutionSQLRepository } from '@infrastructure/data/sql/repositories/institution.repository';
import { ProductSQLRepository } from '@infrastructure/data/sql/repositories/products.repository';
import { UserSQLRepository } from '@infrastructure/data/sql/repositories/user.repository';
import { AuthService as AuthServiceV2 } from '@infrastructure/services/auth.service';
import { ImageStorageService } from '@infrastructure/services/image-storage.service';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtCustomStrategy } from '@presentation/auth/strategies/jwt.strategy';
import { JwtRefreshStrategy } from '@presentation/auth/strategies/jwt-refresh.strategy';
import { LocalStrategy } from '@presentation/auth/strategies/local.strategy';
import { JwtCustomAuthGuard } from '@presentation/auth/guards/jwt-auth.guard';
import { JwtRefreshGuard } from '@presentation/auth/guards/jwt-refresh.guard';
import { AdminGuard } from '@presentation/auth/guards/admin.guard';
import { ClientGuard } from '@presentation/auth/guards/client.guard';
import { RolesGuard } from '@presentation/auth/guards/roles.guard';
import { InstitutionProductSQLRepository } from '@infrastructure/data/sql/repositories/institution-product.repostitoy';
import { InstitutionEventSQLRepository } from '@infrastructure/data/sql/repositories/institution-event.repository';
import { UserEventPhotoSQLRepository } from '@infrastructure/data/sql/repositories/user-event-photo.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        secret: cs.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [
    ConfigService,
    UserSQLRepository,
    InstitutionSQLRepository,
    ProductSQLRepository,
    InstitutionProductSQLRepository,
    InstitutionEventSQLRepository,
    UserEventPhotoSQLRepository,
    AuthServiceV2,
    ImageStorageService,
    // Strategies
    JwtCustomStrategy,
    JwtRefreshStrategy,
    LocalStrategy,
    // Guards
    JwtCustomAuthGuard,
    JwtRefreshGuard,
    AdminGuard,
    ClientGuard,
    RolesGuard,
  ],
  exports: [
    ConfigService,
    UserSQLRepository,
    ImageStorageService,
    ProductSQLRepository,
    AuthServiceV2,
    InstitutionSQLRepository,
    InstitutionProductSQLRepository,
    InstitutionEventSQLRepository,
    UserEventPhotoSQLRepository,
    // Strategies
    JwtCustomStrategy,
    JwtRefreshStrategy,
    LocalStrategy,
    // Guards
    JwtCustomAuthGuard,
    JwtRefreshGuard,
    AdminGuard,
    ClientGuard,
    RolesGuard,
  ],
})
export class InfraModule {}