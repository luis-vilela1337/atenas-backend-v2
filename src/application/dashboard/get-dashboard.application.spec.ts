import { GetDashboardApplication } from './get-dashboard.application';
import { GetDashboardUseCase } from '@core/dashboard/get-dashboard.usecase';

describe('GetDashboardApplication', () => {
  let application: GetDashboardApplication;
  let useCase: jest.Mocked<GetDashboardUseCase>;

  const mockResult = {
    currentRevenue: 50000,
    previousRevenue: 40000,
    currentOrders: 100,
    previousOrders: 80,
    currentPendingOrders: 10,
    previousPendingOrders: 15,
    currentActiveStudents: 200,
    previousActiveStudents: 200,
    revenueSeries: [{ date: '2026-05-01', revenue: 5000, orders: 10 }],
    ordersByPaymentStatus: [{ status: 'APPROVED', count: 80 }],
    itemsByFulfillmentStatus: [{ status: 'ORDER_RECEIVED', count: 50 }],
    topProducts: [
      {
        productId: 'p1',
        productName: 'Album',
        productType: 'ALBUM',
        quantitySold: 30,
        revenue: 15000,
      },
    ],
    topInstitutions: [
      {
        institutionId: 'i1',
        institutionName: 'Turma A',
        contractNumber: '001',
        orders: 20,
        revenue: 10000,
        activeStudents: 50,
      },
    ],
    recentOrders: [
      {
        id: 'o1',
        displayId: 1,
        userId: 'u1',
        userName: 'Maria',
        institutionId: 'i1',
        institutionName: 'Turma A',
        contractNumber: '001',
        totalAmount: 450,
        paymentStatus: 'APPROVED',
        createdAt: new Date('2026-05-05T10:00:00.000Z'),
      },
    ],
  };

  beforeEach(() => {
    useCase = {
      execute: jest.fn().mockResolvedValue(mockResult),
    } as unknown as jest.Mocked<GetDashboardUseCase>;

    application = new GetDashboardApplication(useCase);
  });

  it('should use current month when no dates provided', async () => {
    await application.execute({});

    const call = useCase.execute.mock.calls[0][0];
    const now = new Date();
    expect(call.startDate.getUTCMonth()).toBe(now.getMonth());
    expect(call.startDate.getUTCDate()).toBe(1);
  });

  it('should parse provided dates correctly', async () => {
    await application.execute({
      startDate: '2026-05-01',
      endDate: '2026-05-31',
    });

    const call = useCase.execute.mock.calls[0][0];
    expect(call.startDate.toISOString()).toBe('2026-05-01T00:00:00.000Z');
    expect(call.endDate.toISOString()).toBe('2026-05-31T23:59:59.999Z');
  });

  it('should calculate previous period with same duration', async () => {
    await application.execute({
      startDate: '2026-05-01',
      endDate: '2026-05-31',
    });

    const call = useCase.execute.mock.calls[0][0];
    expect(call.previousEndDate.getTime()).toBeLessThan(
      call.startDate.getTime(),
    );
    const currentDuration =
      call.endDate.getTime() - call.startDate.getTime();
    const previousDuration =
      call.previousEndDate.getTime() - call.previousStartDate.getTime();
    expect(Math.abs(currentDuration - previousDuration)).toBeLessThan(1000);
  });

  it('should pass institutionId to use case', async () => {
    await application.execute({ institutionId: 'inst-123' });

    const call = useCase.execute.mock.calls[0][0];
    expect(call.institutionId).toBe('inst-123');
  });

  it('should return properly formatted response', async () => {
    const response = await application.execute({
      startDate: '2026-05-01',
      endDate: '2026-05-31',
    });

    expect(response.period.startDate).toBe('2026-05-01');
    expect(response.period.endDate).toBe('2026-05-31');
    expect(response.summary.revenue.value).toBe(50000);
    expect(response.summary.revenue.variationPercent).toBe(25);
    expect(response.summary.orders.value).toBe(100);
    expect(response.summary.orders.variationPercent).toBe(25);
    expect(response.summary.pendingOrders.value).toBe(10);
    expect(response.summary.activeStudents.value).toBe(200);
    expect(response.revenueSeries).toHaveLength(1);
    expect(response.ordersByPaymentStatus).toHaveLength(1);
    expect(response.topProducts).toHaveLength(1);
    expect(response.topInstitutions).toHaveLength(1);
    expect(response.recentOrders).toHaveLength(1);
    expect(response.recentOrders[0].createdAt).toBe(
      '2026-05-05T10:00:00.000Z',
    );
  });
});
