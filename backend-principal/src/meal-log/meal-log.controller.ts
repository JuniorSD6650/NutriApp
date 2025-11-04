import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MealLogService } from './meal-log.service';
import { CreateMealLogDto } from './dto/meal-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('meal-logs')
@ApiBearerAuth()
@Controller('meal-logs')
@UseGuards(JwtAuthGuard)
export class MealLogController {
  constructor(private readonly mealLogService: MealLogService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar nueva comida con cálculo nutricional automático' })
  @ApiResponse({ status: 201, description: 'Meal log creado exitosamente con cálculos nutricionales' })
  create(@Body() createMealLogDto: CreateMealLogDto) {
    return this.mealLogService.create(createMealLogDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los meal logs con búsqueda y paginación' })
  @ApiResponse({ status: 200, description: 'Lista paginada de meal logs' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Registros por página (default: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre de paciente o platillo' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.mealLogService.findAll(pageNumber, limitNumber, search);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Obtener meal logs de un paciente específico' })
  @ApiParam({ name: 'patientId', description: 'ID del paciente' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.mealLogService.findByPatient(patientId);
  }

  @Get('patient/:patientId/stats')
  @ApiOperation({ summary: 'Obtener estadísticas nutricionales de un paciente' })
  @ApiParam({ name: 'patientId', description: 'ID del paciente' })
  @ApiQuery({ name: 'days', required: false, description: 'Número de días para el cálculo (default: 7)' })
  getNutritionalStats(
    @Param('patientId') patientId: string,
    @Query('days') days?: string
  ) {
    const dayCount = days ? parseInt(days, 10) : 7;
    return this.mealLogService.getNutritionalStats(patientId, dayCount);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener meal log por ID' })
  findOne(@Param('id') id: string) {
    return this.mealLogService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar meal log' })
  remove(@Param('id') id: string) {
    return this.mealLogService.remove(id);
  }
}
