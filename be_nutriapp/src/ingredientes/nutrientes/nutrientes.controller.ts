// src/ingredientes/nutrientes/nutrientes.controller.ts
import {
  Controller, Get, Post, Body, Patch, Param,
  Delete, UseGuards, ParseUUIDPipe, Query
} from '@nestjs/common';
import { NutrientesService } from './nutrientes.service';
import { CreateNutrienteDto } from './dto/create-nutriente.dto';
import { UpdateNutrienteDto } from './dto/update-nutriente.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../users/enums/role.enum';
import { QueryNutrienteDto } from './dto/query-nutriente.dto';
import { ConfirmDeleteDto } from '../../common/dto/confirm-delete.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
@Controller('nutrientes')
export class NutrientesController {
  constructor(private readonly nutrientesService: NutrientesService) { }

  @Post()
  create(@Body() createNutrienteDto: CreateNutrienteDto) {
    return this.nutrientesService.create(createNutrienteDto);
  }

  @Get()
  findAll(@Query() queryNutrienteDto: QueryNutrienteDto) {
    return this.nutrientesService.findAll(queryNutrienteDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.nutrientesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNutrienteDto: UpdateNutrienteDto
  ) {
    return this.nutrientesService.update(id, updateNutrienteDto);
  }

  @Delete(':id') // <- Desactivar (Soft Delete)
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.nutrientesService.deactivate(id);
  }

  @Patch(':id/restore') // <- Activar
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.nutrientesService.restore(id);
  }

  @Post(':id/force-delete')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() confirmDeleteDto: ConfirmDeleteDto // <-- PEDIR CONFIRMACIÓN
  ) {
    return this.nutrientesService.remove(id, confirmDeleteDto.name);
  }
}