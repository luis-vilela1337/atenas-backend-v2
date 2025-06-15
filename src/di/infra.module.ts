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
import { LocalStrategy } from '@presentation/auth/strategies/local.strategy';

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
        signOptions: { expiresIn: '1h' },
      }),
    }),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [
    ConfigService,
    UserSQLRepository,
    InstitutionSQLRepository,
    ProductSQLRepository,
    AuthServiceV2,
    ImageStorageService,
    JwtCustomStrategy,
    LocalStrategy,
  ],
  exports: [
    ConfigService,
    UserSQLRepository,
    ImageStorageService,
    ProductSQLRepository,
    AuthServiceV2,
    InstitutionSQLRepository,
    JwtCustomStrategy,
    LocalStrategy,
  ],
})
export class InfraModule {}
