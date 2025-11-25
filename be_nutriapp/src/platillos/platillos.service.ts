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
      if (!ingredientes || ingredientes.length === 0) {
        // Buscar el platillo usando el manager dentro de la transacción
        const platilloCompleto = await manager.findOne(Platillo, {
          where: { id: platillo.id },
          relations: ['ingredientes', 'ingredientes.ingrediente'],
        });
        if (!platilloCompleto) {
          throw new NotFoundException(`Platillo con ID ${platillo.id} no encontrado tras guardar`);
        }
        // Calcular el total de ingredientes para el gráfico
        const totalCantidad = platilloCompleto.ingredientes.reduce((sum, pi) => sum + pi.cantidad, 0);
        const ingredientesDetalle = platilloCompleto.ingredientes.map((pi) => ({
          ingredienteId: pi.ingrediente.id,
          nombre: pi.ingrediente.name,
          cantidad: pi.cantidad,
          porcentaje: totalCantidad > 0 ? (pi.cantidad / totalCantidad) * 100 : 0,
        }));
        const result = { ...platilloCompleto, ingredientesDetalle };
        return result;
      }
      // Optimización: buscar todos los ingredientes de una vez
      const ids = ingredientes.map(i => i.ingredienteId);
      const ingredientesDB = await manager.findByIds(Ingrediente, ids);
      if (ingredientesDB.length !== ids.length) {
        const notFound = ids.filter(id => !ingredientesDB.find(i => i.id === id));
        throw new BadRequestException(`Ingredientes no encontrados: ${notFound.join(', ')}`);
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
      const result = await this.findOne(platillo.id);
      return result;
    });
  }

  async findAll(query: QueryPlatilloDto) {
    const { page = 1, limit = 5, name, estado = FiltroEstado.ACTIVO } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    // ✅ Cambia `search` por `name`
    if (name && name.trim().length > 0) {
      where.nombre = Like(`%${name.trim()}%`);
    }

    if (estado === FiltroEstado.ACTIVO) {
      where.deletedAt = IsNull();
    } else if (estado === FiltroEstado.INACTIVO) {
      where.deletedAt = Not(IsNull());
    }

    const [data, total] = await this.platilloRepository.findAndCount({
      where,
      withDeleted: estado !== FiltroEstado.ACTIVO,
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
      relations: ['ingredientes', 'ingredientes.ingrediente'],
    });

    if (!platillo) {
      throw new NotFoundException(`Platillo con ID ${id} no encontrado`);
    }

    // Calcular el total de ingredientes para el gráfico
    const totalCantidad = platillo.ingredientes.reduce((sum, pi) => sum + pi.cantidad, 0);

    const ingredientesDetalle = platillo.ingredientes.map((pi) => ({
      ingredienteId: pi.ingrediente.id, // ✅ AÑADIR ESTE CAMPO
      nombre: pi.ingrediente.name,
      cantidad: pi.cantidad,
      porcentaje: (pi.cantidad / totalCantidad) * 100,
    }));

    return {
      ...platillo,
      ingredientesDetalle,
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
    await this.platilloRepository.softDelete(id);
    // Retorna el platillo actualizado (inactivo)
    return this.findOne(id, true);
  }

  async restore(id: string) {
    await this.platilloRepository.restore(id);
    // Retorna el platillo actualizado (activo)
    return this.findOne(id, true);
  }

  async remove(id: string, confirmName: string) {
    const platillo = await this.findOne(id, true);
    if (platillo.nombre !== confirmName) {
      throw new BadRequestException(`El nombre de confirmación '${confirmName}' no coincide con '${platillo.nombre}'.`);
    }
    await this.platilloRepository.remove(platillo);
    return { message: `Platillo ${platillo.nombre} y sus relaciones han sido eliminados permanentemente.` };
  }

  async addIngrediente(
    platilloId: string,
    dto: { ingredienteId: string; cantidad: number; unidad?: string }
  ) {
    return await this.dataSource.transaction(async manager => {
      const platillo = await manager.findOne(Platillo, {
        where: { id: platilloId },
        relations: ['ingredientes'],
      });
      if (!platillo) throw new NotFoundException(`Platillo con ID ${platilloId} no encontrado`);

      const ingrediente = await manager.findOne(Ingrediente, {
        where: { id: dto.ingredienteId },
      });
      if (!ingrediente) throw new NotFoundException(`Ingrediente con ID ${dto.ingredienteId} no encontrado`);

      const platilloIngrediente = manager.create(PlatilloIngrediente, {
        platillo,
        ingrediente,
        cantidad: dto.cantidad,
        unidad: dto.unidad || 'g',
      });

      await manager.save(PlatilloIngrediente, platilloIngrediente);
      return this.findOne(platilloId);
    });
  }

  async removeIngrediente(platilloId: string, ingredienteId: string) {
    return await this.dataSource.transaction(async manager => {
      const platilloIngrediente = await manager.findOne(PlatilloIngrediente, {
        where: {
          platillo: { id: platilloId },
          ingrediente: { id: ingredienteId },
        },
      });

      if (!platilloIngrediente) {
        throw new NotFoundException('El ingrediente no está en este platillo');
      }

      await manager.remove(PlatilloIngrediente, platilloIngrediente);
      return this.findOne(platilloId);
    });
  }
}
