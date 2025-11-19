import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { PacienteProfilesService } from './paciente-profiles.service';
import { MedicoProfilesService } from './medico-profiles.service';
import { UsersService } from './users.service';
import { CreatePacienteProfileDto } from './dto/create-paciente-profile.dto';
import { UpdatePacienteProfileDto } from './dto/update-paciente-profile.dto';
import { QueryPacienteProfileDto } from './dto/query-paciente-profile.dto';
import { CreateMedicoProfileDto } from './dto/create-medico-profile.dto';
import { UpdateMedicoProfileDto } from './dto/update-medico-profile.dto';
import { QueryMedicoProfileDto } from './dto/query-medico-profile.dto';
import { ConfirmDeleteDto } from '../common/dto/confirm-delete.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from './enums/role.enum';

@Controller('profiles')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProfilesController {
  constructor(
    private readonly pacienteProfilesService: PacienteProfilesService,
    private readonly medicoProfilesService: MedicoProfilesService,
    private readonly usersService: UsersService,
  ) { }

  // PacienteProfile CRUD
  @Get('pacientes')
  @Roles(Role.ADMIN, Role.MEDICO)
  findAllPacientes(@Query() query: QueryPacienteProfileDto) {
    return this.pacienteProfilesService.findAll(query);
  }

  @Get('pacientes/:id')
  @Roles(Role.ADMIN, Role.MEDICO)
  findOnePaciente(@Param('id') id: string) {
    return this.pacienteProfilesService.findOne(id);
  }

  /**
   * Crea o actualiza el perfil de paciente del usuario autenticado.
   * Solo un perfil por usuario.
   */
  @Post('pacientes')
  @Roles(Role.ADMIN, Role.MEDICO, Role.PACIENTE)
  upsertPaciente(@Body() dto: CreatePacienteProfileDto, @Req() req: Request) {
    const user: any = req.user;
    const userId = user?.sub || user?.id || user?.userId;
    if (!userId) {
      throw new Error('No se pudo obtener el ID de usuario del token');
    }
    return this.pacienteProfilesService.upsertWithUser(dto, userId);
  }

  @Patch('pacientes/:id')
  @Roles(Role.ADMIN, Role.MEDICO)
  updatePaciente(@Param('id') id: string, @Body() dto: UpdatePacienteProfileDto) {
    return this.pacienteProfilesService.update(id, dto);
  }

  @Delete('pacientes/:id')
  @Roles(Role.ADMIN)
  deactivatePaciente(@Param('id') id: string) {
    return this.pacienteProfilesService.deactivate(id);
  }

  @Patch('pacientes/:id/restore')
  @Roles(Role.ADMIN)
  restorePaciente(@Param('id') id: string) {
    return this.pacienteProfilesService.restore(id);
  }

  @Post('pacientes/:id/force-delete')
  @Roles(Role.ADMIN)
  forceDeletePaciente(@Param('id') id: string, @Body() confirm: ConfirmDeleteDto) {
    return this.pacienteProfilesService.remove(id, confirm.name);
  }

  // MedicoProfile CRUD
  @Get('medicos')
  @Roles(Role.ADMIN)
  findAllMedicos(@Query() query: QueryMedicoProfileDto) {
    return this.medicoProfilesService.findAll(query);
  }

  @Get('medicos/:id')
  @Roles(Role.ADMIN)
  findOneMedico(@Param('id') id: string) {
    return this.medicoProfilesService.findOne(id);
  }

  /**
   * Crea o actualiza el perfil de médico del usuario autenticado.
   * Solo un perfil por usuario.
   */
  @Post('medicos')
  @Roles(Role.ADMIN, Role.MEDICO)
  upsertMedico(@Body() dto: CreateMedicoProfileDto, @Req() req: Request) {
    const user: any = req.user;
    const userId = dto['userId'] || user?.sub || user?.id || user?.userId;
    if (!userId) throw new Error('Debe especificar el userId o autenticarse');
    return this.medicoProfilesService.upsertWithUser(dto, userId);
  }

  @Patch('medicos/:id')
  @Roles(Role.ADMIN)
  updateMedico(@Param('id') id: string, @Body() dto: UpdateMedicoProfileDto) {
    return this.medicoProfilesService.update(id, dto);
  }

  @Delete('medicos/:id')
  @Roles(Role.ADMIN)
  deactivateMedico(@Param('id') id: string) {
    return this.medicoProfilesService.deactivate(id);
  }

  @Patch('medicos/:id/restore')
  @Roles(Role.ADMIN)
  restoreMedico(@Param('id') id: string) {
    return this.medicoProfilesService.restore(id);
  }

  @Post('medicos/:id/force-delete')
  @Roles(Role.ADMIN)
  forceDeleteMedico(@Param('id') id: string, @Body() confirm: ConfirmDeleteDto) {
    return this.medicoProfilesService.remove(id, confirm.name);
  }

  // ❌ ELIMINAR O COMENTAR ESTOS DOS ENDPOINTS (ya no aplican)
  // @Get('medicos/:id/pacientes')
  // @Roles(Role.ADMIN, Role.MEDICO)
  // async getPacientesDeMedico(@Param('id') id: string) {
  //   const medico = await this.usersService.findMedicoWithPacientes(id);
  //   if (!medico) return [];
  //   return medico.pacientes?.map((p: any) => ({ id: p.id, name: p.name })) || [];
  // }

  // @Post('medicos/:medicoId/asignar-pacientes')
  // @Roles(Role.ADMIN, Role.MEDICO)
  // async asignarPacientesAMedico(
  //   @Param('medicoId') medicoId: string,
  //   @Body('pacienteIds') pacienteIds: string[]
  // ) {
  //   return this.usersService.asignarPacientesAMedico(medicoId, pacienteIds);
  // }
}
