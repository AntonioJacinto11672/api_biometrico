import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TerminalsService } from './terminals.service';

@ApiTags('Terminais Biométricos')
@Controller('terminals')
export class TerminalsController {
  constructor(private readonly service: TerminalsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os terminais biométricos' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes completos de um terminal' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Estatísticas de uso do terminal (punches hoje e no mês)' })
  getStats(@Param('id', ParseIntPipe) id: number) {
    return this.service.getStats(id);
  }
}
