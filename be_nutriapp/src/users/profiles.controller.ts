import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { PacienteProfilesService } from './paciente-profiles.service';
import { MedicoProfilesService } from './medico-profiles.service';
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
  ) {}

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

  @Post('pacientes')
  @Roles(Role.ADMIN, Role.MEDICO)
  createPaciente(@Body() dto: CreatePacienteProfileDto) {
    return this.pacienteProfilesService.create(dto);
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

  @Post('medicos')
  @Roles(Role.ADMIN)
  createMedico(@Body() dto: CreateMedicoProfileDto) {
    return this.medicoProfilesService.create(dto);
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
}
