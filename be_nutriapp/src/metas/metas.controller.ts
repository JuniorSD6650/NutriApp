import { Controller, Post, Body, Req, UseGuards, Get, Param, Patch, Query } from '@nestjs/common';
import { MetasService } from './metas.service';
import { CreateMetaDto } from './dto/create-meta.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
// No importar Request directamente para evitar error TS1272

@Controller('metas')
@UseGuards(AuthGuard('jwt'))
export class MetasController {
  @Patch(':id')
  @Roles(Role.MEDICO, Role.PACIENTE)
  async actualizarMeta(@Param('id') id: string, @Body() body: { hierroConsumido?: number; completada?: boolean }) {
    // Permite actualizar hierroConsumido y/o completada
    return this.metasService.actualizarMeta(id, body);
  }
  constructor(private readonly metasService: MetasService) { }

  @Post()
  @Roles(Role.MEDICO)
  async crearMeta(@Req() req, @Body() dto: CreateMetaDto) {
    // El id del médico viene del token
    const medicoId = req.user?.sub || req.user?.id;
    if (!medicoId) throw new Error('No se pudo determinar el id del médico autenticado');
    return this.metasService.crearMeta(medicoId, dto);
  }

  @Get('mis-metas')
  @Roles(Role.PACIENTE)
  async obtenerMisMetas(@Req() req) {
    const pacienteId = req.user?.sub || req.user?.id;
    if (!pacienteId) throw new Error('No se pudo determinar el id del paciente autenticado');
    return this.metasService.obtenerMetasPorPaciente(pacienteId);
  }

  @Get('mi-meta-activa')
  @Roles(Role.PACIENTE)
  async obtenerMiMetaActiva(
    @Req() req,
    @Query('fecha') fecha?: string 
  ) {
    const pacienteId = req.user?.sub || req.user?.id;
    if (!pacienteId) throw new Error('No se pudo determinar el id del paciente autenticado');

    // Pasar la fecha al servicio
    return this.metasService.obtenerMetaActivaPorPaciente(pacienteId, fecha);
  }

  @Get('paciente/:pacienteId')
  @Roles(Role.MEDICO, Role.PACIENTE)
  async obtenerMetasPorPaciente(@Param('pacienteId') pacienteId: string) {
    return this.metasService.obtenerMetasPorPaciente(pacienteId);
  }
}
