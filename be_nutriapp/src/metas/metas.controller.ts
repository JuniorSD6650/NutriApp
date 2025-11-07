import { Controller, Post, Body, Req, UseGuards, Get, Param } from '@nestjs/common';
import { MetasService } from './metas.service';
import { CreateMetaDto } from './dto/create-meta.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
// No importar Request directamente para evitar error TS1272

@Controller('metas')
@UseGuards(AuthGuard('jwt'))
export class MetasController {
  constructor(private readonly metasService: MetasService) {}

  @Post()
  @Roles(Role.MEDICO)
  async crearMeta(@Req() req, @Body() dto: CreateMetaDto) {
    // El id del médico viene del token
  const medicoId = req.user?.sub || req.user?.id;
  if (!medicoId) throw new Error('No se pudo determinar el id del médico autenticado');
  return this.metasService.crearMeta(medicoId, dto);
  }

  @Get('paciente/:pacienteId')
  @Roles(Role.MEDICO, Role.PACIENTE)
  async obtenerMetasPorPaciente(@Param('pacienteId') pacienteId: string) {
    return this.metasService.obtenerMetasPorPaciente(pacienteId);
  }
}
