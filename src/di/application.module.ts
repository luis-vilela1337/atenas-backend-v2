import { Module } from '@nestjs/common';
import { CoreModule } from './core.module';
import { AuthApplication } from 'src/application/auth/auth.application';
import { CreateNewUserApplication } from '@application/user/create-new-user.application';
import { ListAllUsersApplication } from '@application/user/list-all-user.application';
import {
  UpdateUserApplication,
  UpdateUserV2Application,
} from '@application/user/update-user.application';
import {
  DeleteUserApplication,
  DeleteUserV2Application,
} from '@application/user/delete-user.application';
import { CreateAlbumApplication } from '@application/album/create-album.application';
import { ListUserApplication } from '@application/user/list-user.application';
import { ListAllAlbumApplication } from '@application/album/list-all-album.application';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DeleteAlbumApplication } from '@application/album/delete-album.application';
import { ListAlbumApplication } from '@application/album/list.album.application';
import { UpdateAlbumApplication } from '@application/album/update-album.application';
import { DeletePhotoAlbumApplication } from '@application/album/delete-photo-album.application';
import { UpdatePhotosSignedUrl } from '@application/jobs/album-update-signed-url.application';
import { SetPhotoAlbumApplication } from '@application/album/set-photos.album.application';
import { FindAllUserV2Application } from '@application/user/find-all.application';
import { FindUserByIdV2Application } from '@application/user/find-user-by-id.application';
import { CreateUserV2Application } from '@application/user/create-user.application';
import { FindAllInstitutionApplication } from '@application/insitutiotion/find-all';
import { CreateInstitutionApplication } from '@application/insitutiotion/create';
import { FindByIdInstitutionApplication } from '@application/insitutiotion/find-by-id';
import { UpdateInstitutionApplication } from '@application/insitutiotion/update';
import { DeleteInstitutionApplication } from '@application/insitutiotion/delete';
import { GeneratePresignedUrV2Application } from '@application/storage/presigned-url.application';
import { CreateProductApplication } from '@application/products/create-product.application';

@Module({
  imports: [
    CoreModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  providers: [
    AuthApplication,
    CreateNewUserApplication,
    ListAllUsersApplication,
    UpdateUserApplication,
    DeleteUserApplication,
    CreateAlbumApplication,
    ListUserApplication,
    ListAllAlbumApplication,
    DeleteAlbumApplication,
    ListAlbumApplication,
    UpdateUserApplication,
    UpdateAlbumApplication,
    DeletePhotoAlbumApplication,
    UpdatePhotosSignedUrl,
    SetPhotoAlbumApplication,
    //user
    FindAllUserV2Application,
    FindUserByIdV2Application,
    CreateUserV2Application,
    UpdateUserV2Application,
    DeleteUserV2Application,
    //storage
    GeneratePresignedUrV2Application,
    //institution
    FindAllInstitutionApplication,
    CreateInstitutionApplication,
    FindByIdInstitutionApplication,
    UpdateInstitutionApplication,
    DeleteInstitutionApplication,
    //products
    CreateProductApplication,
  ],
  exports: [
    AuthApplication,
    CreateNewUserApplication,
    ListAllUsersApplication,
    UpdateUserApplication,
    DeleteUserApplication,
    CreateAlbumApplication,
    ListUserApplication,
    ListAllAlbumApplication,
    DeleteAlbumApplication,
    ListAlbumApplication,
    UpdateUserApplication,
    UpdateAlbumApplication,
    DeletePhotoAlbumApplication,
    UpdatePhotosSignedUrl,
    SetPhotoAlbumApplication,
    //user
    FindAllUserV2Application,
    FindUserByIdV2Application,
    CreateUserV2Application,
    UpdateUserV2Application,
    DeleteUserV2Application,
    //storage
    GeneratePresignedUrV2Application,
    //institution
    FindAllInstitutionApplication,
    CreateInstitutionApplication,
    FindByIdInstitutionApplication,
    UpdateInstitutionApplication,
    DeleteInstitutionApplication,
    //products
    CreateProductApplication,
  ],
})
export class ApplicationModule {}
