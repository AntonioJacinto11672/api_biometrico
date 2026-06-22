import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';

@ApiTags('Frequência / Assiduidade')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Resumo diário de frequência (att_day_summary)' })
  @ApiQuery({ name: 'employee_id', required: false, type: Number })
  @ApiQuery({ name: 'date_from', required: false, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'date_to', required: false, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'department_id', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  getDaySummary(
    @Query('employee_id') employee_id?: string,
    @Query('date_from') date_from?: string,
    @Query('date_to') date_to?: string,
    @Query('department_id') department_id?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.service.getDaySummary({
      employee_id: employee_id ? Number(employee_id) : undefined,
      date_from,
      date_to,
      department_id: department_id ? Number(department_id) : undefined,
      limit: limit ? Number(limit) : 100,
      offset: offset ? Number(offset) : 0,
    });
  }

  @Get('details')
  @ApiOperation({ summary: 'Detalhes diários de entrada/saída (att_day_details)' })
  @ApiQuery({ name: 'employee_id', required: false, type: Number })
  @ApiQuery({ name: 'date_from', required: false, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'date_to', required: false, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  getDayDetails(
    @Query('employee_id') employee_id?: string,
    @Query('date_from') date_from?: string,
    @Query('date_to') date_to?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.service.getDayDetails({
      employee_id: employee_id ? Number(employee_id) : undefined,
      date_from,
      date_to,
      limit: limit ? Number(limit) : 100,
      offset: offset ? Number(offset) : 0,
    });
  }

  @Get('daily/:date')
  @ApiOperation({ summary: 'Presença diária de todos os funcionários ativos (YYYY-MM-DD)' })
  getDailyPresence(@Param('date') date: string) {
    return this.service.getDailyPresence(date);
  }

  @Get('monthly/:year/:month')
  @ApiOperation({ summary: 'Relatório mensal de frequência por funcionário' })
  @ApiQuery({ name: 'department_id', required: false, type: Number })
  getMonthlyReport(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Query('department_id') department_id?: string,
  ) {
    return this.service.getMonthlyReport({
      year,
      month,
      department_id: department_id ? Number(department_id) : undefined,
    });
  }
}
