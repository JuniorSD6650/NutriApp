import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AgeRangeService } from './age-range.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('age-ranges')
@ApiBearerAuth()
@Controller('age-ranges')
@UseGuards(JwtAuthGuard)
export class AgeRangeController {
  constructor(private readonly ageRangeService: AgeRangeService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los rangos de edad' })
  @ApiResponse({ status: 200, description: 'Lista de rangos de edad con sus requerimientos y tipos de plato' })
  findAll() {
    return this.ageRangeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener rango de edad por ID' })
  findOne(@Param('id') id: string) {
    return this.ageRangeService.findOne(id);
  }

  @Get('by-months/:months')
  @ApiOperation({ summary: 'Obtener rango de edad por meses de edad' })
  findByMonths(@Param('months') months: string) {
    const ageInMonths = parseInt(months, 10);
    return this.ageRangeService.findByMonths(ageInMonths);
  }
}
