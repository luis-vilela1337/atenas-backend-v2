import { Institution } from './instituition.entity';
import { InstitutionEvent } from './instituition.events';
import { Product } from './products.entity';
import { User } from './user.entity';
import { InstitutionProduct } from './institution-products.entity';
import { UserEventPhoto } from './user-event-photo.entity';
import { MercadoPagoNotification } from './mercado-pago-notification.entity';
import { PaymentStatusHistory } from './payment-status-history.entity';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrderItemDetail } from './order-item-detail.entity';
import { PasswordResetCode } from './password-reset-code.entity';

export * from './instituition.entity';
export * from './instituition.events';
export * from './user.entity';
export * from './institution-products.entity';
export * from './user-event-photo.entity';
export * from './mercado-pago-notification.entity';
export * from './payment-status-history.entity';
export * from './order.entity';
export * from './order-item.entity';
export * from './order-item-detail.entity';
export * from './password-reset-code.entity';
export const entities = [
  Institution,
  User,
  InstitutionEvent,
  Product,
  InstitutionProduct,
  UserEventPhoto,
  MercadoPagoNotification,
  PaymentStatusHistory,
  Order,
  OrderItem,
  OrderItemDetail,
  PasswordResetCode,
];
