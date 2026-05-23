import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '@presentation/auth/guards/admin.guard';
import { GetDashboardApplication } from '@application/dashboard/get-dashboard.application';
import { DashboardQueryDto } from '../dto/dashboard-query.dto';
import { DashboardResponseDto } from '../dto/dashboard-response.dto';

@ApiTags('dashboard')
@Controller('v1/dashboard')
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly getDashboardApp: GetDashboardApplication) {}

  @Get('admin')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Dashboard administrativo com metricas reais',
    description:
      'Retorna metricas agregadas de receita, pedidos, produtos e instituicoes para o painel administrativo',
  })
  @ApiQuery({ type: DashboardQueryDto })
  @ApiResponse({
    status: 200,
    type: DashboardResponseDto,
    description: 'Dados do dashboard retornados com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticacao invalido ou ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso restrito a administradores',
  })
  @HttpCode(HttpStatus.OK)
  async getAdminDashboard(
    @Query() query: DashboardQueryDto,
  ): Promise<DashboardResponseDto> {
    return this.getDashboardApp.execute(query);
  }
}
