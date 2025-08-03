import { Module } from '@nestjs/common';
import { ApplicationModule } from './application.module';
import { PassportModule } from '@nestjs/passport';
import { InfraModule } from './infra.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersControllerV2 } from '@presentation/user/controller';
import { InstitutionController } from '@presentation/instituitions/controller/institutionController';
import { AuthControllerV2 } from '@presentation/auth/http/controller';
import { StorageControllerV2 } from '@presentation/storage/controller';
import { InstitutionProductsController } from '@presentation/institution-product/institution-products.controller';
import { ProductsController } from '@presentation/products/controller/products.controller';
import { UserEventPhotosController } from '@presentation/user-event-photos/controller';
import { MercadoPagoController } from '@presentation/mercado-pago/controller/mercado-pago.controller';

@Module({
  imports: [
    ApplicationModule,
    PassportModule,
    InfraModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [
    UsersControllerV2,
    InstitutionController,
    AuthControllerV2,
    StorageControllerV2,
    InstitutionProductsController,
    ProductsController,
    UserEventPhotosController,
    MercadoPagoController,
  ],
})
export class PresentationModule {}
