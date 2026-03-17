import { Module } from '@nestjs/common';
import { InfraModule } from './infra.module';
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
import { DeleteEventUseCase } from '@core/insituition/delete-event.usecase';
import { SendStudentCredentialsUseCase } from '@core/insituition/send-student-credentials.usecase';
import { DeleteUserByIDV2UseCase } from '@core/user/delete-user.usecase';
import { CreateProductUseCase } from '@core/products/create/usecase';
import { FindAllProductsUseCase } from '@core/products/find-all/usecase';
import { FindProductByIdUseCase } from '@core/products/find-by-id/usecase';
import { DeleteProductUseCase } from '@core/products/delete/usecase';
import { CreateInstitutionProductUseCase } from '@core/institution-products/create/usecase';
import { FindInstitutionProductByIdUseCase } from '@core/institution-products/find-by-id/usecase';
import { FindAllInstitutionProductsUseCase } from '@core/institution-products/find-all/usecase';
import { UpdateInstitutionProductUseCase } from '@core/institution-products/update/usecase';
import { UpdateProductUseCase } from '@core/products/update/usecase';
import { DeleteInstitutionProductUseCase } from '@core/institution-products/delete/usecase';
import { RefreshTokenUseCase } from '@core/auth/refresh-token.usecase';
import { LogoutUseCase } from '@core/auth/logout.usecase';
import { RequestPasswordResetUseCase } from '@core/auth/request-password-reset.usecase';
import { ResetPasswordUseCase } from '@core/auth/reset-password.usecase';
import { CreateUserEventPhotoUseCase } from '@core/user-event-photos/create/usecase';
import { FindUserEventPhotosByUserUseCase } from '@core/user-event-photos/find-by-user/usecase';
import { DeleteUserEventPhotoUseCase } from '@core/user-event-photos/delete/usecase';
import { CreatePreferenceUseCase } from '@core/mercado-pago/create-preference/usecase';
import { FindOrdersUseCase } from '@core/orders/find-orders.usecase';
import { FindOrderByIdUseCase } from '@core/orders/find-order-by-id.usecase';
import { UpdateOrderStatusUseCase } from '@core/orders/update-order-status/usecase';
import { UpdateItemFulfillmentStatusUseCase } from '@core/orders/update-item-fulfillment-status/usecase';
import { CancelOrderByClientUseCase } from '@core/orders/cancel-order-by-client/usecase';
import { UpdateProfileUseCase } from '@core/profile/update-profile.usecase';
import { GetCartUseCase } from '@core/cart/get-cart.usecase';
import { UpdateCartUseCase } from '@core/cart/update-cart.usecase';
import { ClearCartUseCase } from '@core/cart/clear-cart.usecase';

@Module({
  imports: [InfraModule],
  providers: [
    //user
    FindAllUserUseCase,
    FindUserByIDV2UseCase,
    CreateUserV2UseCase,
    UpdateUserV2UseCase,
    GeneratePresignedUrlUseCase,
    DeleteUserByIDV2UseCase,
    //institution
    FindAllInstituitionUseCase,
    FindByIdInstituitionUseCase,
    UpdateInstituitionUseCase,
    DeleteInstituitionUseCase,
    DeleteEventUseCase,
    CreateInstituitionUseCase,
    SendStudentCredentialsUseCase,
    //products
    CreateProductUseCase,
    FindAllProductsUseCase,
    FindProductByIdUseCase,
    DeleteProductUseCase,
    UpdateProductUseCase,
    //institution-products
    CreateInstitutionProductUseCase,
    FindInstitutionProductByIdUseCase,
    FindAllInstitutionProductsUseCase,
    UpdateInstitutionProductUseCase,
    DeleteInstitutionProductUseCase,
    //auth
    RefreshTokenUseCase,
    LogoutUseCase,
    RequestPasswordResetUseCase,
    ResetPasswordUseCase,
    // user-event
    CreateUserEventPhotoUseCase,
    FindUserEventPhotosByUserUseCase,
    DeleteUserEventPhotoUseCase,
    // mercado-pago
    CreatePreferenceUseCase,
    // orders
    FindOrdersUseCase,
    FindOrderByIdUseCase,
    UpdateOrderStatusUseCase,
    UpdateItemFulfillmentStatusUseCase,
    CancelOrderByClientUseCase,
    // profile
    UpdateProfileUseCase,
    // cart
    GetCartUseCase,
    UpdateCartUseCase,
    ClearCartUseCase,
  ],
  exports: [
    //user
    FindAllUserUseCase,
    FindUserByIDV2UseCase,
    CreateUserV2UseCase,
    UpdateUserV2UseCase,
    GeneratePresignedUrlUseCase,
    DeleteUserByIDV2UseCase,
    //institution
    FindAllInstituitionUseCase,
    CreateInstituitionUseCase,
    FindByIdInstituitionUseCase,
    UpdateInstituitionUseCase,
    DeleteInstituitionUseCase,
    DeleteEventUseCase,
    SendStudentCredentialsUseCase,
    //products
    CreateProductUseCase,
    FindAllProductsUseCase,
    FindProductByIdUseCase,
    DeleteProductUseCase,
    UpdateProductUseCase,
    //institution-products
    CreateInstitutionProductUseCase,
    FindInstitutionProductByIdUseCase,
    FindAllInstitutionProductsUseCase,
    UpdateInstitutionProductUseCase,
    DeleteInstitutionProductUseCase,
    //auth
    RefreshTokenUseCase,
    LogoutUseCase,
    RequestPasswordResetUseCase,
    ResetPasswordUseCase,
    // user-event
    CreateUserEventPhotoUseCase,
    FindUserEventPhotosByUserUseCase,
    DeleteUserEventPhotoUseCase,
    // mercado-pago
    CreatePreferenceUseCase,
    // orders
    FindOrdersUseCase,
    FindOrderByIdUseCase,
    UpdateOrderStatusUseCase,
    UpdateItemFulfillmentStatusUseCase,
    CancelOrderByClientUseCase,
    // profile
    UpdateProfileUseCase,
    // cart
    GetCartUseCase,
    UpdateCartUseCase,
    ClearCartUseCase,
  ],
})
export class CoreModule {}
