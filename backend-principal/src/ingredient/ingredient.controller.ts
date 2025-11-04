import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IngredientService } from './ingredient.service';
import { CreateIngredientDto, UpdateIngredientDto } from './dto/ingredient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('ingredients')
@ApiBearerAuth()
@Controller('ingredients')
@UseGuards(JwtAuthGuard)
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo ingrediente' })
  @ApiResponse({ status: 201, description: 'Ingrediente creado exitosamente' })
  create(@Body() createIngredientDto: CreateIngredientDto) {
    return this.ingredientService.create(createIngredientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener ingredientes con paginación' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Registros por página (default: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.ingredientService.findAllPaginated(pageNumber, limitNumber, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener ingrediente por ID' })
  findOne(@Param('id') id: string) {
    return this.ingredientService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar ingrediente' })
  update(@Param('id') id: string, @Body() updateIngredientDto: UpdateIngredientDto) {
    return this.ingredientService.update(id, updateIngredientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar ingrediente' })
  remove(@Param('id') id: string) {
    return this.ingredientService.remove(id);
  }
}
