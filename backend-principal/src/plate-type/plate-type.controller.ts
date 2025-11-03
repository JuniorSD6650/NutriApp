import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PlateTypeService } from './plate-type.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('plate-types')
@ApiBearerAuth()
@Controller('plate-types')
@UseGuards(JwtAuthGuard)
export class PlateTypeController {
  constructor(private readonly plateTypeService: PlateTypeService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los tipos de plato' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de plato con sus rangos de edad' })
  findAll() {
    return this.plateTypeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener tipo de plato por ID' })
  findOne(@Param('id') id: string) {
    return this.plateTypeService.findOne(id);
  }

  @Get('by-age-range/:ageRangeId')
  @ApiOperation({ summary: 'Obtener tipo de plato por rango de edad' })
  findByAgeRange(@Param('ageRangeId') ageRangeId: string) {
    return this.plateTypeService.findByAgeRange(ageRangeId);
  }
}
