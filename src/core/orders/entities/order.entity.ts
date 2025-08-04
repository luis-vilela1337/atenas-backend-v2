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
  shippingDetails: ShippingAddress;
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
  eventId?: string;
  isPackage: boolean;
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  paymentGatewayId?: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateOrderResult {
  orderId: string;
  mercadoPagoCheckoutUrl: string;
}

export interface UpdateOrderStatusInput {
  orderId: string;
  paymentStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  paymentGatewayId?: string;
}
