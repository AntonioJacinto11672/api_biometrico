import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ShiftsService } from './shifts.service';

@ApiTags('Turnos e Horários')
@Controller('shifts')
export class ShiftsController {
  constructor(private readonly service: ShiftsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os turnos' })
  findAllShifts() {
    return this.service.findAllShifts();
  }

  @Get(':id/details')
  @ApiOperation({ summary: 'Detalhes dos dias de um turno' })
  findShiftDetails(@Param('id', ParseIntPipe) id: number) {
    return this.service.findShiftDetails(id);
  }

  @Get('timetables')
  @ApiOperation({ summary: 'Listar todos os horários (timetables)' })
  findAllTimetables() {
    return this.service.findAllTimetables();
  }

  @Get('employee/:id')
  @ApiOperation({ summary: 'Turnos atribuídos a um funcionário' })
  getEmployeeShifts(@Param('id', ParseIntPipe) id: number) {
    return this.service.getEmployeeShifts(id);
  }
}
