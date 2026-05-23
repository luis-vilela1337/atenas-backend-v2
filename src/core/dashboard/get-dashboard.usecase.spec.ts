import { GetDashboardUseCase } from './get-dashboard.usecase';
import { DashboardRepositoryInterface } from './repositories/dashboard.repository.interface';
import { GetDashboardInput } from './dto/get-dashboard.dto';

describe('GetDashboardUseCase', () => {
  let useCase: GetDashboardUseCase;
  let repo: jest.Mocked<DashboardRepositoryInterface>;

  beforeEach(() => {
    repo = {
      getRevenue: jest.fn().mockResolvedValue(0),
      getOrdersCount: jest.fn().mockResolvedValue(0),
      getPendingOrdersCount: jest.fn().mockResolvedValue(0),
      getActiveStudentsCount: jest.fn().mockResolvedValue(0),
      getRevenueSeries: jest.fn().mockResolvedValue([]),
      getOrdersByPaymentStatus: jest.fn().mockResolvedValue([]),
      getItemsByFulfillmentStatus: jest.fn().mockResolvedValue([]),
      getTopProducts: jest.fn().mockResolvedValue([]),
      getTopInstitutions: jest.fn().mockResolvedValue([]),
      getRecentOrders: jest.fn().mockResolvedValue([]),
    };
    useCase = new GetDashboardUseCase(repo);
  });

  const makeInput = (overrides?: Partial<GetDashboardInput>): GetDashboardInput => ({
    startDate: new Date('2026-05-01T00:00:00.000Z'),
    endDate: new Date('2026-05-31T23:59:59.999Z'),
    previousStartDate: new Date('2026-04-01T00:00:00.000Z'),
    previousEndDate: new Date('2026-04-30T23:59:59.999Z'),
    ...overrides,
  });

  it('should call all repository methods in parallel', async () => {
    const input = makeInput();
    await useCase.execute(input);

    expect(repo.getRevenue).toHaveBeenCalledTimes(2);
    expect(repo.getOrdersCount).toHaveBeenCalledTimes(2);
    expect(repo.getPendingOrdersCount).toHaveBeenCalledTimes(2);
    expect(repo.getActiveStudentsCount).toHaveBeenCalledTimes(1);
    expect(repo.getRevenueSeries).toHaveBeenCalledTimes(1);
    expect(repo.getOrdersByPaymentStatus).toHaveBeenCalledTimes(1);
    expect(repo.getItemsByFulfillmentStatus).toHaveBeenCalledTimes(1);
    expect(repo.getTopProducts).toHaveBeenCalledTimes(1);
    expect(repo.getTopInstitutions).toHaveBeenCalledTimes(1);
    expect(repo.getRecentOrders).toHaveBeenCalledTimes(1);
  });

  it('should pass current period to revenue query', async () => {
    const input = makeInput();
    await useCase.execute(input);

    expect(repo.getRevenue).toHaveBeenCalledWith(
      input.startDate,
      input.endDate,
      undefined,
    );
  });

  it('should pass previous period to revenue query', async () => {
    const input = makeInput();
    await useCase.execute(input);

    expect(repo.getRevenue).toHaveBeenCalledWith(
      input.previousStartDate,
      input.previousEndDate,
      undefined,
    );
  });

  it('should pass institutionId to all relevant queries', async () => {
    const input = makeInput({ institutionId: 'inst-123' });
    await useCase.execute(input);

    expect(repo.getRevenue).toHaveBeenCalledWith(
      input.startDate,
      input.endDate,
      'inst-123',
    );
    expect(repo.getOrdersCount).toHaveBeenCalledWith(
      input.startDate,
      input.endDate,
      'inst-123',
    );
    expect(repo.getActiveStudentsCount).toHaveBeenCalledWith('inst-123');
  });

  it('should use day granularity for periods <= 90 days', async () => {
    const input = makeInput({
      startDate: new Date('2026-05-01T00:00:00.000Z'),
      endDate: new Date('2026-05-31T23:59:59.999Z'),
    });
    await useCase.execute(input);

    expect(repo.getRevenueSeries).toHaveBeenCalledWith(
      input.startDate,
      input.endDate,
      'day',
      undefined,
    );
  });

  it('should use month granularity for periods > 90 days', async () => {
    const input = makeInput({
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      endDate: new Date('2026-12-31T23:59:59.999Z'),
    });
    await useCase.execute(input);

    expect(repo.getRevenueSeries).toHaveBeenCalledWith(
      input.startDate,
      input.endDate,
      'month',
      undefined,
    );
  });

  it('should return assembled result from all queries', async () => {
    repo.getRevenue
      .mockResolvedValueOnce(50000)
      .mockResolvedValueOnce(40000);
    repo.getOrdersCount
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(80);
    repo.getPendingOrdersCount
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(15);
    repo.getActiveStudentsCount.mockResolvedValue(200);
    repo.getRevenueSeries.mockResolvedValue([
      { date: '2026-05-01', revenue: 5000, orders: 10 },
    ]);
    repo.getOrdersByPaymentStatus.mockResolvedValue([
      { status: 'APPROVED', count: 80 },
    ]);
    repo.getItemsByFulfillmentStatus.mockResolvedValue([
      { status: 'ORDER_RECEIVED', count: 50 },
    ]);
    repo.getTopProducts.mockResolvedValue([
      {
        productId: 'p1',
        productName: 'Album',
        productType: 'ALBUM',
        quantitySold: 30,
        revenue: 15000,
      },
    ]);
    repo.getTopInstitutions.mockResolvedValue([
      {
        institutionId: 'i1',
        institutionName: 'Turma A',
        contractNumber: '001',
        orders: 20,
        revenue: 10000,
        activeStudents: 50,
      },
    ]);
    repo.getRecentOrders.mockResolvedValue([
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
    ]);

    const input = makeInput();
    const result = await useCase.execute(input);

    expect(result.currentRevenue).toBe(50000);
    expect(result.previousRevenue).toBe(40000);
    expect(result.currentOrders).toBe(100);
    expect(result.previousOrders).toBe(80);
    expect(result.currentPendingOrders).toBe(10);
    expect(result.previousPendingOrders).toBe(15);
    expect(result.currentActiveStudents).toBe(200);
    expect(result.previousActiveStudents).toBe(200);
    expect(result.revenueSeries).toHaveLength(1);
    expect(result.ordersByPaymentStatus).toHaveLength(1);
    expect(result.itemsByFulfillmentStatus).toHaveLength(1);
    expect(result.topProducts).toHaveLength(1);
    expect(result.topInstitutions).toHaveLength(1);
    expect(result.recentOrders).toHaveLength(1);
  });

  it('should return defaults when no data exists', async () => {
    const input = makeInput();
    const result = await useCase.execute(input);

    expect(result.currentRevenue).toBe(0);
    expect(result.previousRevenue).toBe(0);
    expect(result.currentOrders).toBe(0);
    expect(result.previousOrders).toBe(0);
    expect(result.revenueSeries).toEqual([]);
    expect(result.ordersByPaymentStatus).toEqual([]);
    expect(result.topProducts).toEqual([]);
    expect(result.recentOrders).toEqual([]);
  });
});
