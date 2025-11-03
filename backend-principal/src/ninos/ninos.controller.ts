import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { NinosService } from './ninos.service';
import { CreateNinoDto, UpdateNinoDto } from './dto/create-nino.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('ninos')
@ApiBearerAuth()
@Controller('ninos')
@UseGuards(JwtAuthGuard)
export class NinosController {
  constructor(private readonly ninosService: NinosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo niño' })
  @ApiResponse({ status: 201, description: 'Niño creado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  create(@Body(ValidationPipe) createNinoDto: CreateNinoDto, @Request() req) {
    return this.ninosService.create(createNinoDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los niños de la madre autenticada' })
  @ApiResponse({ status: 200, description: 'Lista de niños obtenida exitosamente' })
  findAll(@Request() req) {
    return this.ninosService.findByMadre(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un niño específico' })
  @ApiParam({ name: 'id', description: 'ID del niño' })
  @ApiResponse({ status: 200, description: 'Niño encontrado' })
  @ApiResponse({ status: 404, description: 'Niño no encontrado' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.ninosService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar información de un niño' })
  @ApiParam({ name: 'id', description: 'ID del niño' })
  @ApiResponse({ status: 200, description: 'Niño actualizado exitosamente' })
  update(@Param('id') id: string, @Body(ValidationPipe) updateNinoDto: UpdateNinoDto, @Request() req) {
    return this.ninosService.update(id, updateNinoDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un niño' })
  @ApiParam({ name: 'id', description: 'ID del niño' })
  @ApiResponse({ status: 200, description: 'Niño eliminado exitosamente' })
  remove(@Param('id') id: string, @Request() req) {
    return this.ninosService.remove(id, req.user.id);
  }
}
