import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, IsNull, Not, Like, DataSource } from 'typeorm';
import { Platillo } from './entities/platillo.entity';
import { PlatilloIngrediente } from './entities/platillo-ingrediente.entity';
import { CreatePlatilloDto } from './dto/create-platillo.dto';
import { UpdatePlatilloDto } from './dto/update-platillo.dto';
import { QueryPlatilloDto } from './dto/query-platillo.dto';
import { FiltroEstado } from '../common/enums/filtro-estado.enum';
import { Ingrediente } from '../ingredientes/entities/ingrediente.entity';

@Injectable()
export class PlatillosService {
  constructor(
    @InjectRepository(Platillo)
    private readonly platilloRepository: Repository<Platillo>,
    @InjectRepository(PlatilloIngrediente)
    private readonly platilloIngredienteRepository: Repository<PlatilloIngrediente>,
    @InjectRepository(Ingrediente)
    private readonly ingredienteRepository: Repository<Ingrediente>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(createPlatilloDto: CreatePlatilloDto) {
    const { nombre, descripcion, ingredientes } = createPlatilloDto;
    return await this.dataSource.transaction(async manager => {
      // Validar nombre único
      const exists = await manager.findOne(Platillo, { where: { nombre } });
      if (exists) throw new ConflictException('Ya existe un platillo con ese nombre');
      // Crear platillo
      const platillo = manager.create(Platillo, { nombre, descripcion });
      await manager.save(Platillo, platillo);
      // Si no hay ingredientes, retorna el platillo vacío
      if (!ingredientes || ingredientes.length === 0) return this.findOne(platillo.id);
      // Optimización: buscar todos los ingredientes de una vez
      const ids = ingredientes.map(i => i.ingredienteId);
      const ingredientesDB = await manager.findByIds(Ingrediente, ids);
      if (ingredientesDB.length !== ids.length) {
        const notFound = ids.filter(id => !ingredientesDB.find(i => i.id === id));
        throw new NotFoundException(`Ingredientes no encontrados: ${notFound.join(', ')}`);
      }
      const platilloIngredientes = ingredientes.map(ing => {
        const ingrediente = ingredientesDB.find(i => i.id === ing.ingredienteId);
        return manager.create(PlatilloIngrediente, {
          platillo,
          ingrediente,
          cantidad: ing.cantidad,
          unidad: ing.unidad || 'g',
        });
      });
      await manager.save(PlatilloIngrediente, platilloIngredientes);
      return this.findOne(platillo.id);
    });
  }

  async findAll(query: QueryPlatilloDto) {
    const { page = 1, limit = 5, search, estado = FiltroEstado.ACTIVO } = query;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) where.nombre = Like(`%${search}%`);
    if (estado === FiltroEstado.ACTIVO) where.deletedAt = IsNull();
    else if (estado === FiltroEstado.INACTIVO) where.deletedAt = Not(IsNull());
    const [data, total] = await this.platilloRepository.findAndCount({
      where,
      withDeleted: (estado !== FiltroEstado.ACTIVO),
      relations: ['ingredientes', 'ingredientes.ingrediente'],
      take: limit,
      skip,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, includeInactive = false) {
    const where: any = { id };
    if (!includeInactive) where.deletedAt = IsNull();
    const platillo = await this.platilloRepository.findOne({
      where,
      withDeleted: includeInactive,
      relations: ['ingredientes', 'ingredientes.ingrediente', 'ingredientes.ingrediente.nutrientes', 'ingredientes.ingrediente.nutrientes.nutriente'],
    });
    if (!platillo) throw new NotFoundException(`Platillo con ID ${id} no encontrado`);

    // Calcular nutrientes totales
    const nutrientesTotales: Record<string, number> = {};
    for (const pi of platillo.ingredientes) {
      const ingrediente = pi.ingrediente;
      if (!ingrediente.nutrientes) continue;
      for (const ingNut of ingrediente.nutrientes) {
        const nombreNutriente = ingNut.nutriente?.name;
        if (!nombreNutriente) continue;
        // Proporción: (cantidad usada * valor por 100g) / 100, usando float
        const cantidad = typeof pi.cantidad === 'string' ? Number(pi.cantidad) : pi.cantidad;
        const valorPor100g = typeof ingNut.value_per_100g === 'string' ? Number(ingNut.value_per_100g) : ingNut.value_per_100g;
        const aporte = (cantidad * valorPor100g) / 100;
        if (!nutrientesTotales[nombreNutriente]) nutrientesTotales[nombreNutriente] = 0;
        nutrientesTotales[nombreNutriente] += aporte;
      }
    }

    return {
      ...platillo,
      nutrientesTotales,
    };
  }

  async update(id: string, updatePlatilloDto: UpdatePlatilloDto) {
    return await this.dataSource.transaction(async manager => {
      const platillo = await manager.findOne(Platillo, {
        where: { id },
        relations: ['ingredientes'],
        withDeleted: true,
      });
      if (!platillo) throw new NotFoundException(`Platillo con ID ${id} no encontrado`);
      const { nombre, descripcion, ingredientes } = updatePlatilloDto;
      if (nombre) platillo.nombre = nombre;
      if (descripcion) platillo.descripcion = descripcion;
      await manager.save(Platillo, platillo);
      if (ingredientes) {
        // Borra todos los ingredientes actuales
        await manager.delete(PlatilloIngrediente, { platillo: { id } });
        if (ingredientes.length > 0) {
          // Optimización: buscar todos los ingredientes de una vez
          const ids = ingredientes.map(i => i.ingredienteId);
          const ingredientesDB = await manager.findByIds(Ingrediente, ids);
          if (ingredientesDB.length !== ids.length) {
            const notFound = ids.filter(id => !ingredientesDB.find(i => i.id === id));
            throw new NotFoundException(`Ingredientes no encontrados: ${notFound.join(', ')}`);
          }
          const platilloIngredientes = ingredientes.map(ing => {
            const ingrediente = ingredientesDB.find(i => i.id === ing.ingredienteId);
            return manager.create(PlatilloIngrediente, {
              platillo,
              ingrediente,
              cantidad: ing.cantidad,
              unidad: ing.unidad || 'g',
            });
          });
          await manager.save(PlatilloIngrediente, platilloIngredientes);
        }
      }
      return this.findOne(platillo.id);
    });
  }

  async deactivate(id: string) {
    const platillo = await this.findOne(id);
    await this.platilloRepository.softDelete(id);
    return { message: `Platillo ${platillo.nombre} desactivado.` };
  }

  async restore(id: string) {
    const platillo = await this.findOne(id, true);
    if (!platillo.deletedAt) throw new ConflictException('El platillo ya está activo.');
    await this.platilloRepository.restore(id);
    return { message: `Platillo ${platillo.nombre} activado.` };
  }

  async remove(id: string, confirmName: string) {
    const platillo = await this.findOne(id, true);
    if (platillo.nombre !== confirmName) {
      throw new BadRequestException(`El nombre de confirmación '${confirmName}' no coincide con '${platillo.nombre}'.`);
    }
    await this.platilloRepository.remove(platillo);
    return { message: `Platillo ${platillo.nombre} y sus relaciones han sido eliminados permanentemente.` };
  }
}
