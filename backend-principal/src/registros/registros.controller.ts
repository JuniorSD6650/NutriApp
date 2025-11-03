import { Controller, Post, Get, UploadedFile, UseInterceptors, UseGuards, Param, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { RegistrosService } from './registros.service';
import { UploadFileDto } from './dto/upload-file.dto';

@ApiTags('registros')
@ApiBearerAuth()
@Controller('registros')
@UseGuards(AuthGuard('jwt'))
export class RegistrosController {
  constructor(private readonly registrosService: RegistrosService) {}

  @Post('upload/meal')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir foto de comida para análisis nutricional' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Imagen de la comida',
        },
        ninoId: {
          type: 'string',
          example: 'uuid-del-nino',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Análisis completado y registro guardado' })
  @ApiResponse({ status: 400, description: 'Error en el análisis de la imagen' })
  async uploadMealPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Body('ninoId') ninoId: string,
  ) {
    return this.registrosService.analyzeMeal(file, ninoId);
  }

  @Post('upload/eye-detection')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir foto de mucosa ocular para detección temprana de anemia' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Imagen de la mucosa ocular',
        },
        ninoId: {
          type: 'string',
          example: 'uuid-del-nino',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Análisis completado y registro guardado' })
  @ApiResponse({ status: 400, description: 'Error en el análisis de la imagen' })
  async uploadEyeDetection(
    @UploadedFile() file: Express.Multer.File,
    @Body('ninoId') ninoId: string,
  ) {
    return this.registrosService.analyzeEyeDetection(file, ninoId);
  }

  @Get('comida/:ninoId')
  @ApiOperation({ summary: 'Obtener registros de comida de un niño' })
  @ApiParam({ name: 'ninoId', description: 'ID del niño' })
  @ApiResponse({ status: 200, description: 'Lista de registros de comida' })
  getRegistrosComida(@Param('ninoId') ninoId: string) {
    return this.registrosService.getRegistrosComida(ninoId);
  }

  @Get('deteccion-temprana/:ninoId')
  @ApiOperation({ summary: 'Obtener registros de detección temprana de un niño' })
  @ApiParam({ name: 'ninoId', description: 'ID del niño' })
  @ApiResponse({ status: 200, description: 'Lista de registros de detección temprana' })
  getRegistrosDeteccionTemprana(@Param('ninoId') ninoId: string) {
    return this.registrosService.getRegistrosDeteccionTemprana(ninoId);
  }
}
