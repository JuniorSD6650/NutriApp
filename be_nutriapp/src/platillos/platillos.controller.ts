import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { PlatillosService } from './platillos.service';
import { CreatePlatilloDto } from './dto/create-platillo.dto';
import { UpdatePlatilloDto } from './dto/update-platillo.dto';
import { QueryPlatilloDto } from './dto/query-platillo.dto';
import { ConfirmDeleteDto } from '../common/dto/confirm-delete.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('platillos')
export class PlatillosController {
  constructor(private readonly platillosService: PlatillosService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createPlatilloDto: CreatePlatilloDto) {
    return this.platillosService.create(createPlatilloDto);
  }

  @Get()
  findAll(@Query() query: QueryPlatilloDto) {
    return this.platillosService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.platillosService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePlatilloDto: UpdatePlatilloDto
  ) {
    return this.platillosService.update(id, updatePlatilloDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.platillosService.deactivate(id);
  }

  @Patch(':id/restore')
  @Roles(Role.ADMIN)
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.platillosService.restore(id);
  }

  @Post(':id/force-delete')
  @Roles(Role.ADMIN)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() confirmDeleteDto: ConfirmDeleteDto
  ) {
    return this.platillosService.remove(id, confirmDeleteDto.name);
  }

  // ✅ NUEVO: Agregar ingrediente a platillo
  @Post(':id/ingredientes')
  @Roles(Role.ADMIN)
  async addIngrediente(
    @Param('id') id: string,
    @Body() dto: { ingredienteId: string; cantidad: number; unidad?: string }
  ) {
    return this.platillosService.addIngrediente(id, dto);
  }

  // ✅ NUEVO: Eliminar ingrediente de platillo
  @Delete(':id/ingredientes/:ingredienteId')
  @Roles(Role.ADMIN)
  async removeIngrediente(
    @Param('id') platilloId: string,
    @Param('ingredienteId') ingredienteId: string
  ) {
    return this.platillosService.removeIngrediente(platilloId, ingredienteId);
  }
}
