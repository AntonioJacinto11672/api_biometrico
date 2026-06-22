import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';

@ApiTags('Funcionários')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly service: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os funcionários' })
  @ApiQuery({ name: 'active', required: false, type: Number, description: '1=ativo, 0=inativo' })
  @ApiQuery({ name: 'department_id', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Pesquisar por nome ou PIN' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  findAll(
    @Query('active') active?: string,
    @Query('department_id') department_id?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.service.findAll({
      active: active !== undefined ? Number(active) : undefined,
      department_id: department_id ? Number(department_id) : undefined,
      search,
      limit: limit ? Number(limit) : 50,
      offset: offset ? Number(offset) : 0,
    });
  }

  @Get('pin/:pin')
  @ApiOperation({ summary: 'Buscar funcionário por PIN biométrico' })
  findByPin(@Param('pin') pin: string) {
    return this.service.findByPin(pin);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar funcionário por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
