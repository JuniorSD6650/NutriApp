import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas generales del dashboard' })
  @ApiResponse({ status: 200, description: 'Estadísticas del sistema' })
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('nutrition')
  async getNutrition() {
    return this.dashboardService.getNutritionData();
  }

  @Get('users')
  async getUsers() {
    return this.dashboardService.getAllUsers();
  }

  @Get('children')
  @ApiOperation({ summary: 'Obtener lista de niños registrados' })
  @ApiResponse({ status: 200, description: 'Lista de niños' })
  async getChildren() {
    return this.dashboardService.getChildren();
  }

  @Get('activity')
  async getActivity() {
    const stats = await this.dashboardService.getStats();
    return stats.recentActivity;
  }

  @Get('alerts')
  async getAlerts() {
    const stats = await this.dashboardService.getStats();
    return stats.alerts;
  }

  @Get('early-detection-progress')
  @ApiOperation({ summary: 'Obtener progreso de detección temprana por meses' })
  @ApiResponse({ status: 200, description: 'Datos de progreso mensual' })
  async getEarlyDetectionProgress() {
    return this.dashboardService.getEarlyDetectionProgress();
  }

  @Get('early-detection-distribution')
  @ApiOperation({ summary: 'Obtener distribución de resultados de detección temprana' })
  @ApiResponse({ status: 200, description: 'Distribución de resultados' })
  async getEarlyDetectionDistribution() {
    return this.dashboardService.getEarlyDetectionDistribution();
  }

  @Get('all-detections')
  async getAllDetections() {
    return this.dashboardService.getAllDetections();
  }

  @Get('all-detections-paginated')
  @ApiOperation({ summary: 'Obtener todas las detecciones con paginación' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Registros por página (default: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre de niño' })
  @ApiQuery({ name: 'nivel_alerta', required: false, description: 'Filtrar por nivel de alerta' })
  getAllDetectionsPaginated(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('nivel_alerta') nivelAlerta?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.dashboardService.getAllDetectionsPaginated(pageNumber, limitNumber, search, nivelAlerta);
  }
}
