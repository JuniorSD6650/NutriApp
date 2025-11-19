// src/profiles/profiles.controller.ts
import { Controller, Get, Param, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@Controller('profiles')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('medicos/:medicoId/pacientes')
  @Roles(Role.MEDICO)
  async obtenerPacientesDeMedico(@Param('medicoId') medicoId: string, @Req() req) {
    // Verificar que el médico solo pueda ver sus propios pacientes
    if (req.user.sub !== medicoId) {
      throw new ForbiddenException('No tienes acceso a estos pacientes');
    }
    return this.profilesService.obtenerPacientesDeMedico(medicoId);
  }

  @Get('medicos/:medicoId/estadisticas')
  @Roles(Role.MEDICO)
  async obtenerEstadisticasMedico(@Param('medicoId') medicoId: string, @Req() req) {
    if (req.user.sub !== medicoId) {
      throw new ForbiddenException('No tienes acceso a estas estadísticas');
    }
    return this.profilesService.obtenerEstadisticasMedico(medicoId);
  }
}