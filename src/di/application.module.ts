import { Module } from '@nestjs/common';
import { CoreModule } from './core.module';
import { InfraModule } from './infra.module';
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
import { UpdateProductApplication } from '@application/products/update-product.application';
import { DeleteInstitutionProductApplication } from '@application/institution-products/delete';
import { RefreshTokenApplication } from '@application/auth/refresh-token.application';
import { LogoutApplication } from '@application/auth/logout.application';
import { RequestPasswordResetApplication } from '@application/auth/request-password-reset.application';
import { ResetPasswordApplication } from '@application/auth/reset-password.application';
import { UserEventPhotosApplication } from '@application/user-event-photos/user-event-photos.application';
import { ImageStorageService } from '@infrastructure/services/image-storage.service';
import { CreatePreferenceApplication } from '@application/mercado-pago/create-preference.application';
import { ProcessWebhookApplication } from '@application/mercado-pago/process-webhook.application';
import { CreateOrderApplication } from '@application/orders/create-order.application';
import { FindOrdersApplication } from '@application/orders/find-orders.application';
import { FindOrderByIdApplication } from '@application/orders/find-order-by-id.application';
import { UpdateOrderStatusApplication } from '@application/orders/update-order-status.application';

@Module({
  imports: [
    CoreModule,
    InfraModule,
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
    ImageStorageService,
    //storage
    GeneratePresignedUrV2Application,
    //institution
    FindAllInstitutionApplication,
    CreateInstitutionApplication,
    FindByIdInstitutionApplication,
    UpdateInstitutionApplication,
    DeleteInstitutionApplication,
    UpdateProductApplication,
    //products
    CreateProductApplication,
    FindAllProductsApplication,
    FindProductByIdApplication,
    DeleteProductApplication,
    CreateInstitutionProductApplication,
    FindInstitutionProductByIdApplication,
    FindAllInstitutionProductsApplication,
    UpdateInstitutionProductApplication,
    DeleteInstitutionProductApplication,
    // auth
    RefreshTokenApplication,
    LogoutApplication,
    RequestPasswordResetApplication,
    ResetPasswordApplication,
    UserEventPhotosApplication,
    // mercado-pago
    CreatePreferenceApplication,
    ProcessWebhookApplication,
    // orders
    CreateOrderApplication,
    FindOrdersApplication,
    FindOrderByIdApplication,
    UpdateOrderStatusApplication,
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
    DeleteProductApplication,
    UpdateProductApplication,
    //institution-products
    CreateInstitutionProductApplication,
    FindInstitutionProductByIdApplication,
    FindAllInstitutionProductsApplication,
    UpdateInstitutionProductApplication,
    DeleteInstitutionProductApplication,
    // auth
    RefreshTokenApplication,
    LogoutApplication,
    RequestPasswordResetApplication,
    ResetPasswordApplication,
    //  userEvent
    UserEventPhotosApplication,
    // mercado-pago
    CreatePreferenceApplication,
    ProcessWebhookApplication,
    // orders
    CreateOrderApplication,
    FindOrdersApplication,
    FindOrderByIdApplication,
    UpdateOrderStatusApplication,
  ],
})
export class ApplicationModule {}
