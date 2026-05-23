import { GetDashboardInput, GetDashboardResult } from '@core/dashboard/dto/get-dashboard.dto';
import { DashboardResponseDto } from '@presentation/dashboard/dto/dashboard-response.dto';

export class DashboardAdapter {
  static toResponseDto(
    result: GetDashboardResult,
    input: GetDashboardInput,
  ): DashboardResponseDto {
    return {
      period: {
        startDate: input.startDate.toISOString().split('T')[0],
        endDate: input.endDate.toISOString().split('T')[0],
        previousStartDate: input.previousStartDate.toISOString().split('T')[0],
        previousEndDate: input.previousEndDate.toISOString().split('T')[0],
      },
      summary: {
        revenue: {
          value: result.currentRevenue,
          variationPercent: DashboardAdapter.calcVariation(
            result.currentRevenue,
            result.previousRevenue,
          ),
        },
        orders: {
          value: result.currentOrders,
          variationPercent: DashboardAdapter.calcVariation(
            result.currentOrders,
            result.previousOrders,
          ),
        },
        pendingOrders: {
          value: result.currentPendingOrders,
          variationPercent: DashboardAdapter.calcVariation(
            result.currentPendingOrders,
            result.previousPendingOrders,
          ),
        },
        activeStudents: {
          value: result.currentActiveStudents,
          variationPercent: DashboardAdapter.calcVariation(
            result.currentActiveStudents,
            result.previousActiveStudents,
          ),
        },
      },
      revenueSeries: result.revenueSeries,
      ordersByPaymentStatus: result.ordersByPaymentStatus,
      itemsByFulfillmentStatus: result.itemsByFulfillmentStatus,
      topProducts: result.topProducts,
      topInstitutions: result.topInstitutions,
      recentOrders: result.recentOrders.map((order) => ({
        ...order,
        createdAt: order.createdAt.toISOString
          ? order.createdAt.toISOString()
          : String(order.createdAt),
      })),
    };
  }

  static calcVariation(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100 * 10) / 10;
  }
}
