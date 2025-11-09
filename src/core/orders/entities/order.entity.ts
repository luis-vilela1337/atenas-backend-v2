export interface ShippingAddress {
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface PayerPhone {
  areaCode: string;
  number: string;
}

export interface Payer {
  firstName: string;
  lastName: string;
  email: string;
  phone: PayerPhone;
}

export interface PhotoSelection {
  id: string;
  eventId: string;
}

export interface EventSelection {
  id: string;
  isPackage: boolean;
}

export interface SelectionDetails {
  photos?: PhotoSelection[];
  events?: EventSelection[];
  isFullPackage?: boolean;
  albumPhotos?: string[];
}

export interface CartItem {
  productId: string;
  productName: string;
  productType: 'GENERIC' | 'DIGITAL_FILES' | 'ALBUM';
  totalPrice: number;
  selectionDetails: SelectionDetails;
}

export interface CreateOrderInput {
  userId: string;
  cartItems: CartItem[];
  shippingDetails?: ShippingAddress;
  payer: Payer;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productType: 'GENERIC' | 'DIGITAL_FILES' | 'ALBUM';
  itemPrice: number;
  details: OrderItemDetail[];
}

export interface OrderItemDetail {
  id: string;
  photoId?: string;
  photoFileName?: string;
  eventId?: string;
  eventName?: string;
  isPackage: boolean;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface Order {
  id: string;
  displayId: number;
  userId: string;
  totalAmount: number;
  paymentStatus: OrderStatus;
  paymentGatewayId?: string;
  contractNumber?: string;
  contractUniqueId?: string;
  shippingAddress?: ShippingAddress;
  items: OrderItem[];
  creditUsed?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateOrderResult {
  orderId: string;
  checkoutUrl: string;
  paymentMethod: 'MERCADO_PAGO' | 'CREDIT' | 'FREE';
  contractNumber?: string;
  creditUsed?: number;
  remainingCredit?: number;
}

export interface UpdateOrderStatusInput {
  orderId: string;
  paymentStatus: OrderStatus;
  paymentGatewayId?: string;
  driveLink?: string;
}
