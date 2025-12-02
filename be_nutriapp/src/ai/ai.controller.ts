import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { AiService } from './ai.service';
import { RecognizeDishDto } from './dto/recognize-dish.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('recognize-dish')
  @Roles(Role.PACIENTE, Role.MEDICO, Role.ADMIN)
  async recognizeDish(@Body() dto: RecognizeDishDto) {
    return this.aiService.recognizeDish(dto);
  }

  @Get('usage-stats')
  @Roles(Role.ADMIN)
  getUsageStats() {
    return this.aiService.getUsageStats();
  }
}
