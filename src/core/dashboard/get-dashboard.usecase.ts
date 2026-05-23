import { Inject, Injectable } from '@nestjs/common';
import { GetDashboardInput, GetDashboardResult } from './dto/get-dashboard.dto';
import { DashboardRepositoryInterface } from './repositories/dashboard.repository.interface';

@Injectable()
export class GetDashboardUseCase {
  constructor(
    @Inject('DashboardRepositoryInterface')
    private readonly repo: DashboardRepositoryInterface,
  ) {}

  async execute(input: GetDashboardInput): Promise<GetDashboardResult> {
    const granularity = this.resolveGranularity(input.startDate, input.endDate);

    const [
      currentRevenue,
      previousRevenue,
      currentOrders,
      previousOrders,
      currentPendingOrders,
      previousPendingOrders,
      currentActiveStudents,
      revenueSeries,
      ordersByPaymentStatus,
      itemsByFulfillmentStatus,
      topProducts,
      topInstitutions,
      recentOrders,
    ] = await Promise.all([
      this.repo.getRevenue(input.startDate, input.endDate, input.institutionId),
      this.repo.getRevenue(
        input.previousStartDate,
        input.previousEndDate,
        input.institutionId,
      ),
      this.repo.getOrdersCount(
        input.startDate,
        input.endDate,
        input.institutionId,
      ),
      this.repo.getOrdersCount(
        input.previousStartDate,
        input.previousEndDate,
        input.institutionId,
      ),
      this.repo.getPendingOrdersCount(
        input.startDate,
        input.endDate,
        input.institutionId,
      ),
      this.repo.getPendingOrdersCount(
        input.previousStartDate,
        input.previousEndDate,
        input.institutionId,
      ),
      this.repo.getActiveStudentsCount(input.institutionId),
      this.repo.getRevenueSeries(
        input.startDate,
        input.endDate,
        granularity,
        input.institutionId,
      ),
      this.repo.getOrdersByPaymentStatus(
        input.startDate,
        input.endDate,
        input.institutionId,
      ),
      this.repo.getItemsByFulfillmentStatus(
        input.startDate,
        input.endDate,
        input.institutionId,
      ),
      this.repo.getTopProducts(
        input.startDate,
        input.endDate,
        10,
        input.institutionId,
      ),
      this.repo.getTopInstitutions(input.startDate, input.endDate, 10),
      this.repo.getRecentOrders(10, input.institutionId),
    ]);

    return {
      currentRevenue,
      previousRevenue,
      currentOrders,
      previousOrders,
      currentPendingOrders,
      previousPendingOrders,
      currentActiveStudents,
      previousActiveStudents: currentActiveStudents,
      revenueSeries,
      ordersByPaymentStatus,
      itemsByFulfillmentStatus,
      topProducts,
      topInstitutions,
      recentOrders,
    };
  }

  private resolveGranularity(start: Date, end: Date): 'day' | 'month' {
    const diffDays =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 90 ? 'month' : 'day';
  }
}
