import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';

@ApiTags('Departamentos')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly service: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os departamentos com total de funcionários' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar departamento por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get(':id/employees')
  @ApiOperation({ summary: 'Listar funcionários de um departamento' })
  findEmployees(@Param('id', ParseIntPipe) id: number) {
    return this.service.findEmployees(id);
  }
}
