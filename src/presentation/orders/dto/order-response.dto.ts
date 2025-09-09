import { ApiProperty } from '@nestjs/swagger';

export class ShippingAddressDto {
  @ApiProperty()
  zipCode: string;

  @ApiProperty()
  street: string;

  @ApiProperty()
  number: string;

  @ApiProperty({ required: false })
  complement?: string;

  @ApiProperty()
  neighborhood: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  state: string;
}

export class OrderItemDetailsDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderItemId: string;

  @ApiProperty({ required: false })
  photoUrl?: string;

  @ApiProperty({ required: false })
  eventId?: string;

  @ApiProperty()
  isPackage: boolean;
}

export class OrderItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  productName: string;

  @ApiProperty({
    enum: ['GENERIC', 'DIGITAL_FILES', 'ALBUM'],
  })
  productType: 'GENERIC' | 'DIGITAL_FILES' | 'ALBUM';

  @ApiProperty()
  itemPrice: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty({ type: [OrderItemDetailsDto] })
  details: OrderItemDetailsDto[];
}

export class OrderDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  displayId: number;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty({
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
  })
  paymentStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

  @ApiProperty({ required: false })
  paymentGatewayId?: string;

  @ApiProperty({ required: false })
  contractNumber?: string;

  @ApiProperty({ type: ShippingAddressDto })
  shippingAddress: ShippingAddressDto;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty({ type: [OrderItemDto] })
  items: OrderItemDto[];
}
