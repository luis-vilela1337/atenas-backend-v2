import { Module } from '@nestjs/common';
import { ApplicationModule } from './application.module';
import { PassportModule } from '@nestjs/passport';
import { AuthController as AuthControllerV1 } from 'src/presentation/auth/http/controllers/auth.controller';
import { InfraModule } from './infra.module';
import { UserController } from '@presentation/user/http/controllers/user.controller';
import { AlbumController } from '@presentation/user/http/controllers/album.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersControllerV2 } from '@presentation/user/controller';
import { InstitutionController } from '@presentation/instituitions/controller/institutionController';
import { AuthControllerV2 } from '@presentation/auth/http/controller';
import { StorageControllerV2 } from '@presentation/storage/controller';

@Module({
  imports: [
    ApplicationModule,
    PassportModule,
    InfraModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [
    AuthControllerV1,
    UserController,
    AlbumController,
    UsersControllerV2,
    InstitutionController,
    AuthControllerV2,
    StorageControllerV2,
  ],
  // providers: [BasicStrategy, JwtStrategy, JwtStrategyV2, LocalStrategy],
})
export class PresentationModule {}
