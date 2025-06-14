import { IAlbumRepository } from '@core/v1/abstracts/services/album.repository';
import { IAuthServiceProvider } from '@core/v1/abstracts/services/auth.service';
import { IJwtService } from '@core/v1/abstracts/services/jwt-crypt.service';
import { IPhotoDeletionHistoryRepository } from '@core/v1/abstracts/services/photo-delete.repository';
import { IStorageService } from '@core/v1/abstracts/services/storage.service';
import { IUserRepository } from '@core/v1/abstracts/services/user.repository';
import { Album, AlbumSchema } from '@infrastructure/data/mongo/entities/album';
import {
  PhotoDeletionHistory,
  PhotoDeletionHistorySchema,
} from '@infrastructure/data/mongo/entities/photo-deletion';
import { AlbumRepository } from '@infrastructure/data/mongo/repositories/album.repository';
import { PhotoDeletionHistoryRepository } from '@infrastructure/data/mongo/repositories/delete-photo.repository';
import { UserRepository } from '@infrastructure/data/mongo/repositories/user.repository';
import { entities } from '@infrastructure/data/sql/entities';
import { InstitutionSQLRepository } from '@infrastructure/data/sql/repositories/institution.repository';
import { UserSQLRepository } from '@infrastructure/data/sql/repositories/user.repository';
import { AuthService as AuthServiceV2 } from '@infrastructure/services/auth.service';
import { ImageStorageService } from '@infrastructure/services/image-storage.service';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BasicStrategy } from '@presentation/auth/strategies/basic.strategy';
import { JwtStrategyV1 } from '@presentation/auth/strategies/jwt.strategy';
import { JwtCustomStrategy } from '@presentation/auth/strategies/jwt.strategy';
import { LocalStrategy } from '@presentation/auth/strategies/local.strategy';
import { User, UserSchema } from 'src/infra/data/mongo/entities/user';

const providers = [
  {
    useClass: UserRepository,
    provide: IUserRepository,
  },
  {
    useClass: AlbumRepository,
    provide: IAlbumRepository,
  },
  {
    useClass: PhotoDeletionHistoryRepository,
    provide: IPhotoDeletionHistoryRepository,
  }
];
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
    ...providers,
    ConfigService,
    UserSQLRepository,
    InstitutionSQLRepository,
    AuthServiceV2,
    ImageStorageService,
    BasicStrategy,
    JwtStrategyV1,
    JwtCustomStrategy,
    LocalStrategy,
   
  ],
  exports: [
    ...providers.map((el) => el.provide),
    ConfigService,
    UserSQLRepository,
    ImageStorageService,
    AuthServiceV2,
    InstitutionSQLRepository,
    BasicStrategy,
    JwtStrategyV1,
    JwtCustomStrategy,
    LocalStrategy,
    'JWT_REFRESH_SERVICE',
  ],
})
export class InfraModule {}
