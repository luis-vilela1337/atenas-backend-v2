import { Injectable } from '@nestjs/common';
import { GetDashboardUseCase } from '@core/dashboard/get-dashboard.usecase';
import { GetDashboardInput } from '@core/dashboard/dto/get-dashboard.dto';
import { DashboardQueryDto } from '@presentation/dashboard/dto/dashboard-query.dto';
import { DashboardResponseDto } from '@presentation/dashboard/dto/dashboard-response.dto';
import { DashboardAdapter } from './adapters/dashboard.adapter';

@Injectable()
export class GetDashboardApplication {
  constructor(private readonly getDashboardUseCase: GetDashboardUseCase) {}

  async execute(query: DashboardQueryDto): Promise<DashboardResponseDto> {
    const { startDate, endDate } = this.resolvePeriod(query);
    const { previousStartDate, previousEndDate } =
      this.calculatePreviousPeriod(startDate, endDate);

    const input: GetDashboardInput = {
      startDate,
      endDate,
      previousStartDate,
      previousEndDate,
      institutionId: query.institutionId,
    };

    const result = await this.getDashboardUseCase.execute(input);
    return DashboardAdapter.toResponseDto(result, input);
  }

  private resolvePeriod(query: DashboardQueryDto): {
    startDate: Date;
    endDate: Date;
  } {
    const now = new Date();

    const startDate = query.startDate
      ? new Date(query.startDate + 'T00:00:00.000Z')
      : new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));

    const endDate = query.endDate
      ? new Date(query.endDate + 'T23:59:59.999Z')
      : new Date(
          Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
        );

    return { startDate, endDate };
  }

  private calculatePreviousPeriod(
    startDate: Date,
    endDate: Date,
  ): { previousStartDate: Date; previousEndDate: Date } {
    const durationMs = endDate.getTime() - startDate.getTime();
    const previousEndDate = new Date(startDate.getTime() - 1);
    const previousStartDate = new Date(previousEndDate.getTime() - durationMs);
    return { previousStartDate, previousEndDate };
  }
}
