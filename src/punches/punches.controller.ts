import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PunchesService } from './punches.service';

@ApiTags('Registos de Ponto (Punches)')
@Controller('punches')
export class PunchesController {
  constructor(private readonly service: PunchesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar registos de ponto com filtros' })
  @ApiQuery({ name: 'employee_id', required: false, type: Number })
  @ApiQuery({ name: 'date_from', required: false, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'date_to', required: false, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'terminal_id', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  findAll(
    @Query('employee_id') employee_id?: string,
    @Query('date_from') date_from?: string,
    @Query('date_to') date_to?: string,
    @Query('terminal_id') terminal_id?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.service.findAll({
      employee_id: employee_id ? Number(employee_id) : undefined,
      date_from,
      date_to,
      terminal_id: terminal_id ? Number(terminal_id) : undefined,
      limit: limit ? Number(limit) : 100,
      offset: offset ? Number(offset) : 0,
    });
  }

  @Get('date/:date')
  @ApiOperation({ summary: 'Todos os registos de ponto de uma data (YYYY-MM-DD)' })
  findByDate(@Param('date') date: string) {
    return this.service.findByDate(date);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Resumo de presenças por funcionário num período' })
  @ApiQuery({ name: 'date_from', required: true, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'date_to', required: true, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'department_id', required: false, type: Number })
  summary(
    @Query('date_from') date_from: string,
    @Query('date_to') date_to: string,
    @Query('department_id') department_id?: string,
  ) {
    return this.service.summary({
      date_from,
      date_to,
      department_id: department_id ? Number(department_id) : undefined,
    });
  }

  @Get('employee/:id')
  @ApiOperation({ summary: 'Registos de ponto de um funcionário' })
  @ApiQuery({ name: 'date_from', required: false, type: String })
  @ApiQuery({ name: 'date_to', required: false, type: String })
  findByEmployee(
    @Param('id', ParseIntPipe) id: number,
    @Query('date_from') date_from?: string,
    @Query('date_to') date_to?: string,
  ) {
    return this.service.findByEmployee(id, date_from, date_to);
  }
}
