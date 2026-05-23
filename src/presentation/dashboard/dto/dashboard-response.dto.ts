import { ApiProperty } from '@nestjs/swagger';

class PeriodDto {
  @ApiProperty({ example: '2026-05-01' })
  startDate: string;

  @ApiProperty({ example: '2026-05-31' })
  endDate: string;

  @ApiProperty({ example: '2026-04-01' })
  previousStartDate: string;

  @ApiProperty({ example: '2026-04-30' })
  previousEndDate: string;
}

class SummaryCardDto {
  @ApiProperty({ example: 125000 })
  value: number;

  @ApiProperty({ example: 12.5 })
  variationPercent: number;
}

class SummaryDto {
  @ApiProperty({ type: SummaryCardDto })
  revenue: SummaryCardDto;

  @ApiProperty({ type: SummaryCardDto })
  orders: SummaryCardDto;

  @ApiProperty({ type: SummaryCardDto })
  pendingOrders: SummaryCardDto;

  @ApiProperty({ type: SummaryCardDto })
  activeStudents: SummaryCardDto;
}

class RevenueSeriesItemDto {
  @ApiProperty({ example: '2026-05-01' })
  date: string;

  @ApiProperty({ example: 4200 })
  revenue: number;

  @ApiProperty({ example: 12 })
  orders: number;
}

class StatusCountDto {
  @ApiProperty({ example: 'APPROVED' })
  status: string;

  @ApiProperty({ example: 210 })
  count: number;
}

class TopProductDto {
  @ApiProperty({ example: 'uuid' })
  productId: string;

  @ApiProperty({ example: 'Album' })
  productName: string;

  @ApiProperty({ example: 'ALBUM' })
  productType: string;

  @ApiProperty({ example: 80 })
  quantitySold: number;

  @ApiProperty({ example: 32000 })
  revenue: number;
}

class TopInstitutionDto {
  @ApiProperty({ example: 'uuid' })
  institutionId: string;

  @ApiProperty({ example: 'Turma Medicina 2026' })
  institutionName: string;

  @ApiProperty({ example: '2026-001' })
  contractNumber: string;

  @ApiProperty({ example: 42 })
  orders: number;

  @ApiProperty({ example: 18000 })
  revenue: number;

  @ApiProperty({ example: 120 })
  activeStudents: number;
}

class RecentOrderDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 1 })
  displayId: number;

  @ApiProperty({ example: 'uuid' })
  userId: string;

  @ApiProperty({ example: 'Maria Silva' })
  userName: string;

  @ApiProperty({ example: 'uuid' })
  institutionId: string;

  @ApiProperty({ example: 'Turma Medicina 2026' })
  institutionName: string;

  @ApiProperty({ example: '2026-001' })
  contractNumber: string;

  @ApiProperty({ example: 450 })
  totalAmount: number;

  @ApiProperty({ example: 'APPROVED' })
  paymentStatus: string;

  @ApiProperty({ example: '2026-05-05T10:00:00.000Z' })
  createdAt: string;
}

export class DashboardResponseDto {
  @ApiProperty({ type: PeriodDto })
  period: PeriodDto;

  @ApiProperty({ type: SummaryDto })
  summary: SummaryDto;

  @ApiProperty({ type: [RevenueSeriesItemDto] })
  revenueSeries: RevenueSeriesItemDto[];

  @ApiProperty({ type: [StatusCountDto] })
  ordersByPaymentStatus: StatusCountDto[];

  @ApiProperty({ type: [StatusCountDto] })
  itemsByFulfillmentStatus: StatusCountDto[];

  @ApiProperty({ type: [TopProductDto] })
  topProducts: TopProductDto[];

  @ApiProperty({ type: [TopInstitutionDto] })
  topInstitutions: TopInstitutionDto[];

  @ApiProperty({ type: [RecentOrderDto] })
  recentOrders: RecentOrderDto[];
}
