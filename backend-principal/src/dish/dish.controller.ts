import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Obtener todos los platillos' })
  @ApiResponse({ status: 200, description: 'Lista de platillos con sus composiciones' })
  findAll() {
    return this.dishService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener platillo por ID' })
  findOne(@Param('id') id: string) {
    return this.dishService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar platillo' })
  update(@Param('id') id: string, @Body() updateDishDto: UpdateDishDto) {
    return this.dishService.update(id, updateDishDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar platillo' })
  remove(@Param('id') id: string) {
    return this.dishService.remove(id);
  }
}
