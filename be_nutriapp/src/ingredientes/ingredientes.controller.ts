// src/ingredientes/ingredientes.controller.ts
import {
  Controller, Get, Post, Body, Param, UseGuards,
  ParseUUIDPipe, Patch, Delete, Query
} from '@nestjs/common';
import { IngredientesService } from './ingredientes.service';
// ... (imports de DTOs, Guards, Roles)
import { CreateIngredienteDto } from './dto/create-ingrediente.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { UpdateIngredienteDto } from './dto/update-ingrediente.dto';
import { QueryIngredienteDto } from './dto/query-ingrediente.dto';
import { ConfirmDeleteDto } from '../common/dto/confirm-delete.dto';

@Controller('ingredientes')
export class IngredientesController {
  constructor(private readonly ingredientesService: IngredientesService) { }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createIngredienteDto: CreateIngredienteDto) {
    return this.ingredientesService.create(createIngredienteDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.MEDICO, Role.PACIENTE)
  findAll(@Query() queryIngredienteDto: QueryIngredienteDto) {
    return this.ingredientesService.findAll(queryIngredienteDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.MEDICO, Role.PACIENTE)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ingredientesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateIngredienteDto: UpdateIngredienteDto
  ) {
    return this.ingredientesService.update(id, updateIngredienteDto);
  }

  @Delete(':id') // <- Desactivar (Soft Delete)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.ingredientesService.deactivate(id);
  }

  @Patch(':id/restore') // <- Activar
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.ingredientesService.restore(id);
  }

  @Post(':id/force-delete')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() confirmDeleteDto: ConfirmDeleteDto // <-- PEDIR CONFIRMACIÓN
  ) {
    return this.ingredientesService.remove(id, confirmDeleteDto.name);
  }
}