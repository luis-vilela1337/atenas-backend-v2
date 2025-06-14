import { Module } from '@nestjs/common';
import { InfraModule } from './infra.module';
import { AuthUseCase } from '@core/v1/usecases/auth.usecase';
import { CreateNewUserUseCase } from '@core/v1/usecases/create-new-user.usecase';
import { ListAllUseCase } from '@core/v1/usecases/list-all-users.usecase';
import { UpdateUserUseCase } from '@core/v1/usecases/update-user.usecase';
import { DeleteUserUseCase } from '@core/v1/usecases/delete-user.usecase';
import { CreateAlbumUseCase } from '@core/v1/usecases/create-album.usecase';
import { ListUserUseCase } from '@core/v1/usecases/list-user.usecase';
import { ListAllAlbumUseCase } from '@core/v1/usecases/list-all-album.usecase';
import { DeletAlbumUseCase } from '@core/v1/usecases/delete.album.usecase';
import { ListAlbumUseCase } from '@core/v1/usecases/list-album.usecase';
import { UpdateAlbumUseCase } from '@core/v1/usecases/update-album.usecase';
import { DeletePhotoAlbumUseCase } from '@core/v1/usecases/delete-photo-album.usecase';
import { SetPhotoAlbumUseCase } from '@core/v1/usecases/set-photos.usecase';
import { UpdateUserProfilePhotosUseCase } from '@core/v1/dto/usecase/jobs/update-user-profile-photo.usecase';
import { UpdateAlbumPhotosUseCase } from '@core/v1/dto/usecase/jobs/update-album-photo.usecase';
import { FindAllUserUseCase } from '@core/user/find-all.usecase';
import { FindUserByIDV2UseCase } from '@core/user/find-by-id.usecase';
import { CreateUserV2UseCase } from '@core/user/create-user.usecase';
import { UpdateUserV2UseCase } from '@core/user/update-user.usecase';
import { GeneratePresignedUrlUseCase } from '@core/storage/generate-presigned-url/usecase';
import { FindAllInstituitionUseCase } from '@core/insituition/find-all.usecase';
import { CreateInstituitionUseCase } from '@core/insituition/create.usecase';
import { FindByIdInstituitionUseCase } from '@core/insituition/find-by-id.usecase';
import { UpdateInstituitionUseCase } from '@core/insituition/update.usecase';
import { DeleteInstituitionUseCase } from '@core/insituition/delete.usecase';
import { DeleteUserByIDV2UseCase } from '@core/user/delete-user.usecase';

@Module({
  imports: [InfraModule],
  providers: [
    AuthUseCase,
    CreateNewUserUseCase,
    ListAllUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    ListUserUseCase,
    CreateAlbumUseCase,
    ListAllAlbumUseCase,
    ListAlbumUseCase,
    DeletAlbumUseCase,
    UpdateUserUseCase,
    UpdateAlbumUseCase,
    DeletePhotoAlbumUseCase,
    SetPhotoAlbumUseCase,
    UpdateUserProfilePhotosUseCase,
    UpdateAlbumPhotosUseCase,
    //user
    FindAllUserUseCase,
    FindUserByIDV2UseCase,
    CreateUserV2UseCase,
    UpdateUserV2UseCase,
    GeneratePresignedUrlUseCase,
    DeleteUserByIDV2UseCase,
    FindAllInstituitionUseCase,
    FindByIdInstituitionUseCase,
    UpdateInstituitionUseCase,
    DeleteInstituitionUseCase,
    CreateInstituitionUseCase,
  ],
  exports: [
    AuthUseCase,
    CreateNewUserUseCase,
    ListAllUseCase,
    ListUserUseCase,
    DeleteUserUseCase,
    UpdateUserUseCase,
    CreateAlbumUseCase,
    DeletAlbumUseCase,
    ListAllAlbumUseCase,
    ListAlbumUseCase,
    UpdateUserUseCase,
    UpdateAlbumUseCase,
    DeletePhotoAlbumUseCase,
    SetPhotoAlbumUseCase,
    UpdateUserProfilePhotosUseCase,
    UpdateAlbumPhotosUseCase,
    //user
    FindAllUserUseCase,
    FindUserByIDV2UseCase,
    CreateUserV2UseCase,
    UpdateUserV2UseCase,
    GeneratePresignedUrlUseCase,
    DeleteUserByIDV2UseCase,
    FindAllInstituitionUseCase,
    CreateInstituitionUseCase,
    FindByIdInstituitionUseCase,
    UpdateInstituitionUseCase,
    DeleteInstituitionUseCase,
  ],
})
export class CoreModule {}
