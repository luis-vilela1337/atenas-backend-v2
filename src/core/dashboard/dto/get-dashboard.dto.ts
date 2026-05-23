export interface GetDashboardInput {
  startDate: Date;
  endDate: Date;
  previousStartDate: Date;
  previousEndDate: Date;
  institutionId?: string;
}

export interface RevenueSeriesItem {
  date: string;
  revenue: number;
  orders: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface TopProductResult {
  productId: string;
  productName: string;
  productType: string;
  quantitySold: number;
  revenue: number;
}

export interface TopInstitutionResult {
  institutionId: string;
  institutionName: string;
  contractNumber: string;
  orders: number;
  revenue: number;
  activeStudents: number;
}

export interface RecentOrderResult {
  id: string;
  displayId: number;
  userId: string;
  userName: string;
  institutionId: string;
  institutionName: string;
  contractNumber: string;
  totalAmount: number;
  paymentStatus: string;
  createdAt: Date;
}

export interface GetDashboardResult {
  currentRevenue: number;
  previousRevenue: number;
  currentOrders: number;
  previousOrders: number;
  currentPendingOrders: number;
  previousPendingOrders: number;
  currentActiveStudents: number;
  previousActiveStudents: number;
  revenueSeries: RevenueSeriesItem[];
  ordersByPaymentStatus: StatusCount[];
  itemsByFulfillmentStatus: StatusCount[];
  topProducts: TopProductResult[];
  topInstitutions: TopInstitutionResult[];
  recentOrders: RecentOrderResult[];
}
