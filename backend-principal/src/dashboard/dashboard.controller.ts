import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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
    return this.dashboardService.getAllChildren();
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
    return this.dashboardService.getEarlyDetectionProgressData();
  }

  @Get('early-detection-distribution')
  @ApiOperation({ summary: 'Obtener distribución de resultados de detección temprana' })
  @ApiResponse({ status: 200, description: 'Distribución de resultados' })
  async getEarlyDetectionDistribution() {
    return this.dashboardService.getEarlyDetectionDistributionData();
  }

  @Get('all-detections')
  async getAllDetections() {
    return this.dashboardService.getAllDetections();
  }
}
