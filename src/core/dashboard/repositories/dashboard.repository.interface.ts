import {
  RevenueSeriesItem,
  StatusCount,
  TopProductResult,
  TopInstitutionResult,
  RecentOrderResult,
} from '../dto/get-dashboard.dto';

export interface DashboardRepositoryInterface {
  getRevenue(
    startDate: Date,
    endDate: Date,
    institutionId?: string,
  ): Promise<number>;

  getOrdersCount(
    startDate: Date,
    endDate: Date,
    institutionId?: string,
  ): Promise<number>;

  getPendingOrdersCount(
    startDate: Date,
    endDate: Date,
    institutionId?: string,
  ): Promise<number>;

  getActiveStudentsCount(institutionId?: string): Promise<number>;

  getRevenueSeries(
    startDate: Date,
    endDate: Date,
    granularity: 'day' | 'month',
    institutionId?: string,
  ): Promise<RevenueSeriesItem[]>;

  getOrdersByPaymentStatus(
    startDate: Date,
    endDate: Date,
    institutionId?: string,
  ): Promise<StatusCount[]>;

  getItemsByFulfillmentStatus(
    startDate: Date,
    endDate: Date,
    institutionId?: string,
  ): Promise<StatusCount[]>;

  getTopProducts(
    startDate: Date,
    endDate: Date,
    limit: number,
    institutionId?: string,
  ): Promise<TopProductResult[]>;

  getTopInstitutions(
    startDate: Date,
    endDate: Date,
    limit: number,
  ): Promise<TopInstitutionResult[]>;

  getRecentOrders(
    limit: number,
    institutionId?: string,
  ): Promise<RecentOrderResult[]>;
}
