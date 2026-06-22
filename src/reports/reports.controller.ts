import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('Relatórios')
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard geral — totais e últimas marcações' })
  getDashboard() {
    return this.service.getDashboard();
  }

  @Get('absent/:date')
  @ApiOperation({ summary: 'Funcionários ausentes numa data (YYYY-MM-DD)' })
  @ApiQuery({ name: 'department_id', required: false, type: Number })
  getAbsentReport(
    @Param('date') date: string,
    @Query('department_id') department_id?: string,
  ) {
    return this.service.getAbsentReport(date, department_id ? Number(department_id) : undefined);
  }

  @Get('late/:date')
  @ApiOperation({ summary: 'Funcionários com atraso numa data (YYYY-MM-DD)' })
  @ApiQuery({ name: 'department_id', required: false, type: Number })
  getLateArrivals(
    @Param('date') date: string,
    @Query('department_id') department_id?: string,
  ) {
    return this.service.getLateArrivals(date, department_id ? Number(department_id) : undefined);
  }

  @Get('top-presence')
  @ApiOperation({ summary: 'Ranking de presença num período' })
  @ApiQuery({ name: 'date_from', required: true, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'date_to', required: true, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTopPresence(
    @Query('date_from') date_from: string,
    @Query('date_to') date_to: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getTopPresence({ date_from, date_to, limit: limit ? Number(limit) : 20 });
  }
}
