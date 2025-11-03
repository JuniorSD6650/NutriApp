import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getGeneralStats() {
    return this.dashboardService.getGeneralStats();
  }

  @Get('nutrition')
  getNutritionStats() {
    return this.dashboardService.getNutritionAverages();
  }

  @Get('hemoglobin')
  getHemoglobinStats() {
    return this.dashboardService.getHemoglobinStats();
  }

  @Get('activity')
  getRecentActivity() {
    return this.dashboardService.getRecentActivity();
  }

  @Get('alerts')
  getAlerts() {
    return this.dashboardService.getAlertsAndRecommendations();
  }

  @Get('users')
  getAllUsers() {
    return this.dashboardService.getAllUsers();
  }

  @Get('children')
  getAllChildren() {
    return this.dashboardService.getAllChildren();
  }
}
