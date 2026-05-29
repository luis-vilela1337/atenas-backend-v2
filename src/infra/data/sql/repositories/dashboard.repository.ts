import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { User } from '../entities/user.entity';
import { DashboardRepositoryInterface } from '@core/dashboard/repositories/dashboard.repository.interface';
import {
  RevenueSeriesItem,
  StatusCount,
  TopProductResult,
  TopInstitutionResult,
  RecentOrderResult,
} from '@core/dashboard/dto/get-dashboard.dto';

@Injectable()
export class DashboardRepository implements DashboardRepositoryInterface {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getRevenue(
    startDate: Date,
    endDate: Date,
    institutionId?: string,
  ): Promise<number> {
    const params: unknown[] = [startDate, endDate];
    let institutionFilter = '';
    if (institutionId) {
      params.push(institutionId);
      institutionFilter = `AND o."userId" IN (SELECT u.id FROM users u WHERE u.institution_id = $${params.length})`;
    }

    const result = await this.orderRepo.query(
      `SELECT COALESCE(SUM(o."totalAmount"::numeric), 0) as revenue
       FROM orders o
       WHERE o."paymentStatus" IN ('APPROVED', 'COMPLETED')
         AND o.created_at >= $1 AND o.created_at <= $2
         ${institutionFilter}`,
      params,
    );

    return parseFloat(result[0]?.revenue ?? '0');
  }

  async getOrdersCount(
    startDate: Date,
    endDate: Date,
    institutionId?: string,
  ): Promise<number> {
    const params: unknown[] = [startDate, endDate];
    let institutionFilter = '';
    if (institutionId) {
      params.push(institutionId);
      institutionFilter = `AND o."userId" IN (SELECT u.id FROM users u WHERE u.institution_id = $${params.length})`;
    }

    const result = await this.orderRepo.query(
      `SELECT COUNT(*)::int as count
       FROM orders o
       WHERE o.created_at >= $1 AND o.created_at <= $2
         ${institutionFilter}`,
      params,
    );

    return result[0]?.count ?? 0;
  }

  async getPendingOrdersCount(
    startDate: Date,
    endDate: Date,
    institutionId?: string,
  ): Promise<number> {
    const params: unknown[] = [startDate, endDate];
    let institutionFilter = '';
    if (institutionId) {
      params.push(institutionId);
      institutionFilter = `AND o."userId" IN (SELECT u.id FROM users u WHERE u.institution_id = $${params.length})`;
    }

    const result = await this.orderRepo.query(
      `SELECT COUNT(*)::int as count
       FROM orders o
       WHERE o."paymentStatus" = 'PENDING'
         AND o.created_at >= $1 AND o.created_at <= $2
         ${institutionFilter}`,
      params,
    );

    return result[0]?.count ?? 0;
  }

  async getActiveStudentsCount(institutionId?: string): Promise<number> {
    const params: unknown[] = [];
    let institutionFilter = '';
    if (institutionId) {
      params.push(institutionId);
      institutionFilter = `AND u.institution_id = $${params.length}`;
    }

    const result = await this.userRepo.query(
      `SELECT COUNT(*)::int as count
       FROM users u
       WHERE u.role = 'client' AND u.status = 'active'
         ${institutionFilter}`,
      params,
    );

    return result[0]?.count ?? 0;
  }

  async getRevenueSeries(
    startDate: Date,
    endDate: Date,
    granularity: 'day' | 'month',
    institutionId?: string,
  ): Promise<RevenueSeriesItem[]> {
    const params: unknown[] = [startDate, endDate];
    let institutionFilter = '';
    if (institutionId) {
      params.push(institutionId);
      institutionFilter = `AND o."userId" IN (SELECT u.id FROM users u WHERE u.institution_id = $${params.length})`;
    }

    const dateExpr =
      granularity === 'day'
        ? `TO_CHAR(o.created_at, 'YYYY-MM-DD')`
        : `TO_CHAR(o.created_at, 'YYYY-MM')`;

    const result = await this.orderRepo.query(
      `SELECT
         ${dateExpr} as date,
         COALESCE(SUM(CASE WHEN o."paymentStatus" IN ('APPROVED','COMPLETED') THEN o."totalAmount"::numeric ELSE 0 END), 0) as revenue,
         COUNT(*)::int as orders
       FROM orders o
       WHERE o.created_at >= $1 AND o.created_at <= $2
         ${institutionFilter}
       GROUP BY ${dateExpr}
       ORDER BY date ASC`,
      params,
    );

    return result.map((row: { date: string; revenue: string; orders: number }) => ({
      date: row.date,
      revenue: parseFloat(row.revenue),
      orders: row.orders,
    }));
  }

  async getOrdersByPaymentStatus(
    startDate: Date,
    endDate: Date,
    institutionId?: string,
  ): Promise<StatusCount[]> {
    const params: unknown[] = [startDate, endDate];
    let institutionFilter = '';
    if (institutionId) {
      params.push(institutionId);
      institutionFilter = `AND o."userId" IN (SELECT u.id FROM users u WHERE u.institution_id = $${params.length})`;
    }

    const result = await this.orderRepo.query(
      `SELECT o."paymentStatus" as status, COUNT(*)::int as count
       FROM orders o
       WHERE o.created_at >= $1 AND o.created_at <= $2
         ${institutionFilter}
       GROUP BY o."paymentStatus"
       ORDER BY count DESC`,
      params,
    );

    return result.map((row: { status: string; count: number }) => ({
      status: row.status,
      count: row.count,
    }));
  }

  async getItemsByFulfillmentStatus(
    startDate: Date,
    endDate: Date,
    institutionId?: string,
  ): Promise<StatusCount[]> {
    const params: unknown[] = [startDate, endDate];
    let institutionFilter = '';
    if (institutionId) {
      params.push(institutionId);
      institutionFilter = `AND o."userId" IN (SELECT u.id FROM users u WHERE u.institution_id = $${params.length})`;
    }

    const result = await this.orderRepo.query(
      `SELECT oi.fulfillment_status as status, COUNT(*)::int as count
       FROM order_items oi
         INNER JOIN orders o ON o.id = oi."orderId"
       WHERE o.created_at >= $1 AND o.created_at <= $2
         ${institutionFilter}
       GROUP BY oi.fulfillment_status
       ORDER BY count DESC`,
      params,
    );

    return result.map((row: { status: string; count: number }) => ({
      status: row.status,
      count: row.count,
    }));
  }

  async getTopProducts(
    startDate: Date,
    endDate: Date,
    limit: number,
    institutionId?: string,
  ): Promise<TopProductResult[]> {
    const params: unknown[] = [startDate, endDate];
    let institutionFilter = '';
    if (institutionId) {
      params.push(institutionId);
      institutionFilter = `AND o."userId" IN (SELECT u.id FROM users u WHERE u.institution_id = $${params.length})`;
    }
    params.push(limit);

    const result = await this.orderRepo.query(
      `SELECT
         oi."productId" as "productId",
         oi."productName" as "productName",
         oi."productType" as "productType",
         COALESCE(SUM(oi.quantity), 0)::int as "quantitySold",
         COALESCE(SUM(oi."itemPrice"::numeric * COALESCE(oi.quantity, 1)), 0) as revenue
       FROM order_items oi
         INNER JOIN orders o ON o.id = oi."orderId"
       WHERE o."paymentStatus" IN ('APPROVED', 'COMPLETED')
         AND o.created_at >= $1 AND o.created_at <= $2
         ${institutionFilter}
       GROUP BY oi."productId", oi."productName", oi."productType"
       ORDER BY revenue DESC
       LIMIT $${params.length}`,
      params,
    );

    return result.map(
      (row: {
        productId: string;
        productName: string;
        productType: string;
        quantitySold: number;
        revenue: string;
      }) => ({
        productId: row.productId,
        productName: row.productName,
        productType: row.productType,
        quantitySold: row.quantitySold,
        revenue: parseFloat(row.revenue),
      }),
    );
  }

  async getTopInstitutions(
    startDate: Date,
    endDate: Date,
    limit: number,
  ): Promise<TopInstitutionResult[]> {
    const result = await this.orderRepo.query(
      `SELECT
         i.id as "institutionId",
         i.name as "institutionName",
         i."contractNumber" as "contractNumber",
         COUNT(DISTINCT o.id)::int as orders,
         COALESCE(SUM(CASE WHEN o."paymentStatus" IN ('APPROVED','COMPLETED') THEN o."totalAmount"::numeric ELSE 0 END), 0) as revenue,
         (SELECT COUNT(*)::int FROM users u2 WHERE u2.institution_id = i.id AND u2.role = 'client' AND u2.status = 'active') as "activeStudents"
       FROM institutions i
         INNER JOIN users u ON u.institution_id = i.id
         INNER JOIN orders o ON o."userId" = u.id
       WHERE o.created_at >= $1 AND o.created_at <= $2
       GROUP BY i.id, i.name, i."contractNumber"
       ORDER BY revenue DESC
       LIMIT $3`,
      [startDate, endDate, limit],
    );

    return result.map(
      (row: {
        institutionId: string;
        institutionName: string;
        contractNumber: string;
        orders: number;
        revenue: string;
        activeStudents: number;
      }) => ({
        institutionId: row.institutionId,
        institutionName: row.institutionName,
        contractNumber: row.contractNumber,
        orders: row.orders,
        revenue: parseFloat(row.revenue),
        activeStudents: row.activeStudents,
      }),
    );
  }

  async getRecentOrders(
    limit: number,
    institutionId?: string,
  ): Promise<RecentOrderResult[]> {
    const params: unknown[] = [];
    let whereClause = '';
    if (institutionId) {
      params.push(institutionId);
      whereClause = `WHERE u.institution_id = $${params.length}`;
    }
    params.push(limit);

    const result = await this.orderRepo.query(
      `SELECT
         o.id,
         o.display_id as "displayId",
         o."userId" as "userId",
         u.name as "userName",
         i.id as "institutionId",
         i.name as "institutionName",
         i."contractNumber" as "contractNumber",
         o."totalAmount" as "totalAmount",
         o."paymentStatus" as "paymentStatus",
         o.created_at as "createdAt"
       FROM orders o
         INNER JOIN users u ON u.id = o."userId"
         INNER JOIN institutions i ON i.id = u.institution_id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT $${params.length}`,
      params,
    );

    return result.map(
      (row: {
        id: string;
        displayId: number;
        userId: string;
        userName: string;
        institutionId: string;
        institutionName: string;
        contractNumber: string;
        totalAmount: string;
        paymentStatus: string;
        createdAt: Date;
      }) => ({
        id: row.id,
        displayId: row.displayId,
        userId: row.userId,
        userName: row.userName,
        institutionId: row.institutionId,
        institutionName: row.institutionName,
        contractNumber: row.contractNumber,
        totalAmount: parseFloat(row.totalAmount as string),
        paymentStatus: row.paymentStatus,
        createdAt: row.createdAt,
      }),
    );
  }
}
