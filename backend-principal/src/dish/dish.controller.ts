import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DishService } from './dish.service';
import { CreateDishDto, UpdateDishDto } from './dto/dish.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('dishes')
@ApiBearerAuth()
@Controller('dishes')
@UseGuards(JwtAuthGuard)
export class DishController {
  constructor(private readonly dishService: DishService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo platillo' })
  @ApiResponse({ status: 201, description: 'Platillo creado exitosamente' })
  create(@Body() createDishDto: CreateDishDto) {
    return this.dishService.create(createDishDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener platillos con paginación' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Registros por página (default: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre o descripción' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrar por estado (active/inactive)' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.dishService.findAllPaginated(pageNumber, limitNumber, search, status);
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener solo platillos activos' })
  @ApiResponse({ status: 200, description: 'Lista de platillos activos' })
  findAllActive() {
    return this.dishService.findAllActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener platillo por ID' })
  findOne(@Param('id') id: string) {
    return this.dishService.findOne(id);
  }

  @Get(':id/dependencies')
  @ApiOperation({ summary: 'Verificar dependencias antes de eliminar' })
  @ApiResponse({ status: 200, description: 'Información sobre dependencias del platillo' })
  checkDependencies(@Param('id') id: string) {
    return this.dishService.checkDependencies(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar platillo' })
  update(@Param('id') id: string, @Body() updateDishDto: UpdateDishDto) {
    return this.dishService.update(id, updateDishDto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Desactivar platillo' })
  @ApiResponse({ status: 200, description: 'Platillo desactivado exitosamente' })
  deactivate(@Param('id') id: string) {
    return this.dishService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activar platillo' })
  @ApiResponse({ status: 200, description: 'Platillo activado exitosamente' })
  activate(@Param('id') id: string) {
    return this.dishService.activate(id);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Alternar estado del platillo' })
  @ApiResponse({ status: 200, description: 'Estado del platillo cambiado exitosamente' })
  toggleStatus(@Param('id') id: string) {
    return this.dishService.toggleStatus(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar platillo' })
  @ApiResponse({ status: 200, description: 'Platillo eliminado exitosamente' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar debido a dependencias' })
  remove(@Param('id') id: string) {
    return this.dishService.remove(id);
  }
}
