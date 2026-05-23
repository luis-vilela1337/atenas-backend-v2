import { DashboardAdapter } from './dashboard.adapter';

describe('DashboardAdapter', () => {
  describe('calcVariation', () => {
    it('should calculate positive variation', () => {
      expect(DashboardAdapter.calcVariation(120, 100)).toBe(20);
    });

    it('should calculate negative variation', () => {
      expect(DashboardAdapter.calcVariation(80, 100)).toBe(-20);
    });

    it('should return 0 when both values are 0', () => {
      expect(DashboardAdapter.calcVariation(0, 0)).toBe(0);
    });

    it('should return 100 when previous is 0 and current is positive', () => {
      expect(DashboardAdapter.calcVariation(50, 0)).toBe(100);
    });

    it('should return 0 when both are equal', () => {
      expect(DashboardAdapter.calcVariation(100, 100)).toBe(0);
    });

    it('should round to 1 decimal place', () => {
      expect(DashboardAdapter.calcVariation(133, 100)).toBe(33);
      expect(DashboardAdapter.calcVariation(133.33, 100)).toBe(33.3);
    });
  });

  describe('toResponseDto', () => {
    const makeInput = () => ({
      startDate: new Date('2026-05-01T00:00:00.000Z'),
      endDate: new Date('2026-05-31T23:59:59.999Z'),
      previousStartDate: new Date('2026-04-01T00:00:00.000Z'),
      previousEndDate: new Date('2026-04-30T23:59:59.999Z'),
    });

    const makeResult = () => ({
      currentRevenue: 50000,
      previousRevenue: 40000,
      currentOrders: 100,
      previousOrders: 80,
      currentPendingOrders: 10,
      previousPendingOrders: 15,
      currentActiveStudents: 200,
      previousActiveStudents: 200,
      revenueSeries: [],
      ordersByPaymentStatus: [],
      itemsByFulfillmentStatus: [],
      topProducts: [],
      topInstitutions: [],
      recentOrders: [],
    });

    it('should map period dates to ISO date strings', () => {
      const dto = DashboardAdapter.toResponseDto(makeResult(), makeInput());

      expect(dto.period.startDate).toBe('2026-05-01');
      expect(dto.period.endDate).toBe('2026-05-31');
      expect(dto.period.previousStartDate).toBe('2026-04-01');
      expect(dto.period.previousEndDate).toBe('2026-04-30');
    });

    it('should calculate revenue variation', () => {
      const dto = DashboardAdapter.toResponseDto(makeResult(), makeInput());
      expect(dto.summary.revenue.value).toBe(50000);
      expect(dto.summary.revenue.variationPercent).toBe(25);
    });

    it('should calculate negative pending orders variation', () => {
      const dto = DashboardAdapter.toResponseDto(makeResult(), makeInput());
      expect(dto.summary.pendingOrders.value).toBe(10);
      expect(dto.summary.pendingOrders.variationPercent).toBe(-33.3);
    });

    it('should return 0 variation for equal active students', () => {
      const dto = DashboardAdapter.toResponseDto(makeResult(), makeInput());
      expect(dto.summary.activeStudents.variationPercent).toBe(0);
    });

    it('should convert recentOrders createdAt to ISO string', () => {
      const result = makeResult();
      result.recentOrders = [
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
      ];

      const dto = DashboardAdapter.toResponseDto(result, makeInput());
      expect(dto.recentOrders[0].createdAt).toBe('2026-05-05T10:00:00.000Z');
    });

    it('should handle empty arrays', () => {
      const dto = DashboardAdapter.toResponseDto(makeResult(), makeInput());
      expect(dto.revenueSeries).toEqual([]);
      expect(dto.ordersByPaymentStatus).toEqual([]);
      expect(dto.itemsByFulfillmentStatus).toEqual([]);
      expect(dto.topProducts).toEqual([]);
      expect(dto.topInstitutions).toEqual([]);
      expect(dto.recentOrders).toEqual([]);
    });
  });
});
