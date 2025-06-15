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
import { DeleteUserByIDV2UseCase } from '@core/user/delete-user.usecase';
import { CreateProductUseCase } from '@core/products/create/usecase';
import { FindAllProductsUseCase } from '@core/products/find-all/usecase';
import { FindProductByIdUseCase } from '@core/products/find-by-id/usecase';

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
    CreateInstituitionUseCase,
    //products
    CreateProductUseCase,
    FindAllProductsUseCase,
    FindProductByIdUseCase,
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
    //products
    CreateProductUseCase,
    FindAllProductsUseCase,
    FindProductByIdUseCase,
  ],
})
export class CoreModule {}
