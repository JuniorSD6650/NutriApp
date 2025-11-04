import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DishCompositionService } from './dish-composition.service';
import { CreateDishCompositionDto } from './dto/create-dish-composition.dto';
import { UpdateDishCompositionDto } from './dto/update-dish-composition.dto';

@ApiTags('dish-compositions')
@ApiBearerAuth()
@Controller('dish-compositions')
@UseGuards(AuthGuard('jwt'))
export class DishCompositionController {
  constructor(private readonly dishCompositionService: DishCompositionService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva composición de platillo' })
  @ApiResponse({ status: 201, description: 'Composición creada exitosamente' })
  create(@Body() createDishCompositionDto: CreateDishCompositionDto) {
    return this.dishCompositionService.create(createDishCompositionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las composiciones' })
  @ApiResponse({ status: 200, description: 'Lista de composiciones' })
  findAll() {
    return this.dishCompositionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener composición por ID' })
  @ApiResponse({ status: 200, description: 'Composición encontrada' })
  findOne(@Param('id') id: string) {
    return this.dishCompositionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar composición' })
  @ApiResponse({ status: 200, description: 'Composición actualizada' })
  update(@Param('id') id: string, @Body() updateDishCompositionDto: UpdateDishCompositionDto) {
    return this.dishCompositionService.update(id, updateDishCompositionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar composición' })
  @ApiResponse({ status: 200, description: 'Composición eliminada' })
  remove(@Param('id') id: string) {
    return this.dishCompositionService.remove(id);
  }

  @Get('dish/:dishId')
  @ApiOperation({ summary: 'Obtener composiciones por platillo' })
  @ApiResponse({ status: 200, description: 'Lista de composiciones del platillo' })
  findByDish(@Param('dishId') dishId: string) {
    return this.dishCompositionService.findByDish(dishId);
  }
}
