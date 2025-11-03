import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats() {
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
  async getEarlyDetectionProgress() {
    return this.dashboardService.getEarlyDetectionProgressData();
  }

  @Get('early-detection-distribution')
  async getEarlyDetectionDistribution() {
    return this.dashboardService.getEarlyDetectionDistributionData();
  }

  @Get('all-detections')
  async getAllDetections() {
    return this.dashboardService.getAllDetections();
  }
}
