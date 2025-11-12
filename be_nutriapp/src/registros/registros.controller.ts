import { Controller, Get, Post, Body, Query, Param, UploadedFile, UseInterceptors, UseGuards, Req, ParseUUIDPipe, Patch, Delete } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { RegistrosService } from './registros.service';
import { CreateRegistroConsumoDto } from './dto/create-registro-consumo.dto';
import { QueryRegistroConsumoDto } from './dto/query-registro-consumo.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateRegistroConsumoDto } from './dto/update-registro-consumo.dto';
import { ConfirmDeleteDto } from '../common/dto/confirm-delete.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('registros')
export class RegistrosController {
  constructor(private readonly registrosService: RegistrosService) {}

  @Get('consumo/paciente/:pacienteId')
  @Roles(Role.MEDICO, Role.ADMIN)
  async getResumenDiarioPorMedico(
    @Req() req,
    @Param('pacienteId') pacienteId: string,
    @Query('fecha') fecha: string,
  ) {
    const medicoId = req.user.id;
    return this.registrosService.getResumenDiarioPorMedico(medicoId, pacienteId, fecha);
  }

  @Post('consumo')
  @Roles(Role.PACIENTE)
  @UseInterceptors(FileInterceptor('foto'))
  async create(
    @UploadedFile() foto: Express.Multer.File,
    @Body() dto: CreateRegistroConsumoDto,
    @Req() req
  ) {
    // req.user debe tener el id del usuario autenticado
    const userId = req.user.id;
    const fotoPath = `/uploads/consumo/${foto.filename}`;
    return this.registrosService.create(userId, dto, fotoPath);
  }

  @Get('consumo')
  @Roles(Role.PACIENTE)
  async findAll(@Req() req, @Query() query: QueryRegistroConsumoDto) {
    const userId = req.user.id;
    return this.registrosService.findAll(userId, query);
  }

  @Get('consumo/:id')
  @Roles(Role.PACIENTE)
  async findOne(@Req() req, @Param('id', ParseUUIDPipe) id: string) {
    const userId = req.user.id;
    return this.registrosService.findOne(userId, id);
  }

  // PATCH /registros/consumo/:id
  @Patch('consumo/:id')
  @Roles(Role.PACIENTE)
  async update(
    @Req() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRegistroConsumoDto
  ) {
    const userId = req.user.id;
    return this.registrosService.update(userId, id, dto);
  }

  // DELETE /registros/consumo/:id
  @Delete('consumo/:id')
  @Roles(Role.PACIENTE)
  async remove(
    @Req() req,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    const userId = req.user.id;
    return this.registrosService.softDelete(userId, id);
  }

  // PATCH /registros/consumo/:id/restore
  @Patch('consumo/:id/restore')
  @Roles(Role.PACIENTE)
  async restore(
    @Req() req,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    const userId = req.user.id;
    return this.registrosService.restore(userId, id);
  }

  // POST /registros/consumo/:id/force-delete
  @Post('consumo/:id/force-delete')
  async forceDelete(
    @Req() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() confirmDeleteDto: ConfirmDeleteDto
  ) {
    const userId = req.user.id;
    return this.registrosService.forceDelete(userId, id, confirmDeleteDto.name);
  }

  // GET /registros/resumen-dia (para paciente autenticada)
  @Get('resumen-dia')
  @Roles(Role.PACIENTE)
  async resumenDia(@Req() req, @Query('fecha') fecha: string) {
    const userId = req.user.id;
    return this.registrosService.resumenDia(userId, fecha);
  }
}
