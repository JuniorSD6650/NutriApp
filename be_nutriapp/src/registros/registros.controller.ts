import { Controller, Get, Post, Body, Query, Param, UploadedFile, UseInterceptors, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { RegistrosService } from './registros.service';
import { CreateRegistroConsumoDto } from './dto/create-registro-consumo.dto';
import { QueryRegistroConsumoDto } from './dto/query-registro-consumo.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('registros')
export class RegistrosController {
  constructor(private readonly registrosService: RegistrosService) {}

  @Get('consumo/paciente/:pacienteId')
  @Roles(Role.MEDICO)
  async getResumenDiarioPorMedico(
    @Req() req,
    @Param('pacienteId') pacienteId: string,
    @Query('fecha') fecha: string,
  ) {
    const medicoId = req.user.id;
    return this.registrosService.getResumenDiarioPorMedico(medicoId, pacienteId, fecha);
  }

  @Post('consumo')
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
  async findAll(@Req() req, @Query() query: QueryRegistroConsumoDto) {
    const userId = req.user.id;
    return this.registrosService.findAll(userId, query);
  }

  @Get('consumo/:id')
  async findOne(@Req() req, @Param('id', ParseUUIDPipe) id: string) {
    const userId = req.user.id;
    return this.registrosService.findOne(userId, id);
  }
}
