import { Module } from '@nestjs/common';
import { CoreModule } from './core.module';
import { UpdateUserV2Application } from '@application/user/update-user.application';
import { DeleteUserV2Application } from '@application/user/delete-user.application';

import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
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
import { FindAllProductsApplication } from '@application/products/find-all-products.application';
import { FindProductByIdApplication } from '@application/products/find-by-id-products.application';
import { DeleteProductApplication } from '@application/products/delete-product.application';
import { CreateInstitutionProductApplication } from '@application/institution-products/create';
import { FindInstitutionProductByIdApplication } from '@application/institution-products/find-by-id';
import { FindAllInstitutionProductsApplication } from '@application/institution-products/find-all';
import { UpdateInstitutionProductApplication } from '@application/institution-products/update';

@Module({
  imports: [
    CoreModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  providers: [
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
    FindAllProductsApplication,
    FindProductByIdApplication,
    DeleteProductApplication,
    CreateInstitutionProductApplication,
    FindInstitutionProductByIdApplication,
    FindAllInstitutionProductsApplication,
    UpdateInstitutionProductApplication,
  ],
  exports: [
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
    FindAllProductsApplication,
    FindProductByIdApplication,
    DeleteProductApplication, //TODO rota de update de produtos

    //institution-products
    CreateInstitutionProductApplication,
    FindInstitutionProductByIdApplication,
    FindAllInstitutionProductsApplication,
    UpdateInstitutionProductApplication,
  ],
})
export class ApplicationModule {}
