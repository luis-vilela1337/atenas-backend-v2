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
  quantity: number;
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
  quantity: number;
  fulfillmentStatus: FulfillmentStatus;
  details: OrderItemDetail[];
  finalizadoEm?: Date;
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

export enum FulfillmentStatus {
  ORDER_RECEIVED = 'ORDER_RECEIVED',
  PHOTOS_SEPARATED = 'PHOTOS_SEPARATED',
  PRODUCT_MANUFACTURED = 'PRODUCT_MANUFACTURED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  SENT = 'SENT',
}

export const FULFILLMENT_TRANSITIONS: Record<
  string,
  Record<string, FulfillmentStatus[]>
> = {
  ALBUM: {
    [FulfillmentStatus.ORDER_RECEIVED]: [FulfillmentStatus.PHOTOS_SEPARATED],
    [FulfillmentStatus.PHOTOS_SEPARATED]: [
      FulfillmentStatus.PRODUCT_MANUFACTURED,
    ],
    [FulfillmentStatus.PRODUCT_MANUFACTURED]: [FulfillmentStatus.IN_TRANSIT],
    [FulfillmentStatus.IN_TRANSIT]: [FulfillmentStatus.DELIVERED],
    [FulfillmentStatus.DELIVERED]: [],
  },
  GENERIC: {
    [FulfillmentStatus.ORDER_RECEIVED]: [FulfillmentStatus.PHOTOS_SEPARATED],
    [FulfillmentStatus.PHOTOS_SEPARATED]: [
      FulfillmentStatus.PRODUCT_MANUFACTURED,
    ],
    [FulfillmentStatus.PRODUCT_MANUFACTURED]: [FulfillmentStatus.IN_TRANSIT],
    [FulfillmentStatus.IN_TRANSIT]: [FulfillmentStatus.DELIVERED],
    [FulfillmentStatus.DELIVERED]: [],
  },
  DIGITAL_FILES: {
    [FulfillmentStatus.ORDER_RECEIVED]: [FulfillmentStatus.PHOTOS_SEPARATED],
    [FulfillmentStatus.PHOTOS_SEPARATED]: [FulfillmentStatus.SENT],
    [FulfillmentStatus.SENT]: [],
  },
};

export const FULFILLMENT_STEPS: Record<
  string,
  { status: FulfillmentStatus; label: string; description: string }[]
> = {
  ALBUM: [
    {
      status: FulfillmentStatus.ORDER_RECEIVED,
      label: 'Pedido Recebido',
      description: 'Separando as fotos',
    },
    {
      status: FulfillmentStatus.PHOTOS_SEPARATED,
      label: 'Fotos Separadas',
      description: 'Confeccionando o produto',
    },
    {
      status: FulfillmentStatus.PRODUCT_MANUFACTURED,
      label: 'Produto Confeccionado',
      description: 'Preparando pra entrega',
    },
    {
      status: FulfillmentStatus.IN_TRANSIT,
      label: 'Produto em Rota',
      description: 'Entregando',
    },
    {
      status: FulfillmentStatus.DELIVERED,
      label: 'Entregue',
      description: '',
    },
  ],
  GENERIC: [
    {
      status: FulfillmentStatus.ORDER_RECEIVED,
      label: 'Pedido Recebido',
      description: 'Separando as fotos',
    },
    {
      status: FulfillmentStatus.PHOTOS_SEPARATED,
      label: 'Fotos Separadas',
      description: 'Confeccionando o produto',
    },
    {
      status: FulfillmentStatus.PRODUCT_MANUFACTURED,
      label: 'Produto Confeccionado',
      description: 'Preparando pra entrega',
    },
    {
      status: FulfillmentStatus.IN_TRANSIT,
      label: 'Produto em Rota',
      description: 'Entregando',
    },
    {
      status: FulfillmentStatus.DELIVERED,
      label: 'Entregue',
      description: '',
    },
  ],
  DIGITAL_FILES: [
    {
      status: FulfillmentStatus.ORDER_RECEIVED,
      label: 'Pedido Recebido',
      description: 'Separando Fotos',
    },
    {
      status: FulfillmentStatus.PHOTOS_SEPARATED,
      label: 'Fotos Separadas',
      description: 'Preparando para envio',
    },
    {
      status: FulfillmentStatus.SENT,
      label: 'Enviada',
      description: '',
    },
  ],
};

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
  creditRestored?: boolean;
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
