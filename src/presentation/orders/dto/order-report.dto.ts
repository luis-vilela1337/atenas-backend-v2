import { ApiProperty } from '@nestjs/swagger';

class ReportStudentDto {
  @ApiProperty({ example: 'Angelica Pereira Lopes' })
  name: string;
}

class ReportBuyerDto {
  @ApiProperty({ example: 'Luana Lopes Alves' })
  name: string;

  @ApiProperty({ example: '67885623498', required: false })
  cpf?: string | null;

  @ApiProperty({ example: 'angelica.lopes.pereira@gmail.com', required: false })
  email?: string | null;

  @ApiProperty({ example: '35999289992', required: false })
  phone?: string | null;
}

class ReportAmountsDto {
  @ApiProperty({ example: 1000 })
  orderAmount: number;

  @ApiProperty({ example: 250 })
  atenasCreditUsed: number;

  @ApiProperty({ example: 69.8, required: false })
  mercadoPagoFee?: number | null;

  @ApiProperty({ example: 680.2, required: false })
  netReceivedAmount?: number | null;

  @ApiProperty({ example: 750, required: false })
  totalPaidAmount?: number | null;
}

class ReportPaymentDto {
  @ApiProperty({
    example: 'MERCADO_PAGO',
    enum: ['MERCADO_PAGO', 'CREDIT', 'FREE', 'UNKNOWN'],
  })
  provider: 'MERCADO_PAGO' | 'CREDIT' | 'FREE' | 'UNKNOWN';

  @ApiProperty({ example: 'approved' })
  status: string;

  @ApiProperty({ example: 'visa', required: false })
  methodId?: string | null;

  @ApiProperty({ example: 'credit_card', required: false })
  methodType?: string | null;

  @ApiProperty({ example: 5, required: false })
  installments?: number | null;

  @ApiProperty({ example: 150, required: false })
  installmentAmount?: number | null;

  @ApiProperty({ example: '5x cartão de crédito' })
  description: string;
}

class ReportDeliveryDto {
  @ApiProperty({ example: '37552-007' })
  zipCode: string;

  @ApiProperty({ example: 'Rua Londrina' })
  street: string;

  @ApiProperty({ example: '210' })
  number: string;

  @ApiProperty({ required: false })
  complement?: string | null;

  @ApiProperty({ example: 'Jardim Canadá' })
  neighborhood: string;

  @ApiProperty({ example: 'Pouso Alegre' })
  city: string;

  @ApiProperty({ example: 'MG' })
  state: string;

  @ApiProperty({ example: '35999289992', required: false })
  phone?: string | null;

  @ApiProperty({ example: 'angelica.lopes.pereira@gmail.com', required: false })
  email?: string | null;
}

export class OrderReportDto {
  @ApiProperty({ example: '2026-03-03T10:00:00.000Z' })
  saleDate: string;

  @ApiProperty({ example: '2520-001' })
  contractNumber: string;

  @ApiProperty({ type: ReportStudentDto })
  student: ReportStudentDto;

  @ApiProperty({ type: ReportBuyerDto })
  buyer: ReportBuyerDto;

  @ApiProperty({ type: ReportAmountsDto })
  amounts: ReportAmountsDto;

  @ApiProperty({ type: ReportPaymentDto })
  payment: ReportPaymentDto;

  @ApiProperty({ type: ReportDeliveryDto, required: false })
  delivery?: ReportDeliveryDto | null;
}
