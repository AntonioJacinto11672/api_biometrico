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

  @Get('monthly-declaration')
  @ApiOperation({
    summary: 'Relatório de Declaração Mensal',
    description:
      'Devolve, por funcionário, o detalhe diário de assiduidade no formato do relatório PDF: ' +
      'Entrada/Saída, Break, Late-In, Early-Out, Ausência, Horas Requeridas, Round Work, OT1/OT2/OT3, ' +
      'Horas de Exceção e linha de Totais.',
  })
  @ApiQuery({ name: 'date_from', required: true,  type: String, description: 'Início do período (YYYY-MM-DD)' })
  @ApiQuery({ name: 'date_to',   required: true,  type: String, description: 'Fim do período (YYYY-MM-DD)' })
  @ApiQuery({ name: 'department_id', required: false, type: Number, description: 'Filtrar por secção/departamento' })
  @ApiQuery({ name: 'employee_id',   required: false, type: Number, description: 'Filtrar por funcionário' })
  getMonthlyDeclaration(
    @Query('date_from') date_from: string,
    @Query('date_to')   date_to: string,
    @Query('department_id') department_id?: string,
    @Query('employee_id')   employee_id?: string,
  ) {
    return this.service.getMonthlyDeclaration({
      date_from,
      date_to,
      department_id: department_id ? Number(department_id) : undefined,
      employee_id:   employee_id   ? Number(employee_id)   : undefined,
    });
  }
}
