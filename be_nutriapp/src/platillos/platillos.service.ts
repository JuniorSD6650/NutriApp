import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, Like } from 'typeorm';
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
  ) {}

  async create(createPlatilloDto: CreatePlatilloDto) {
    const { nombre, descripcion, ingredientes } = createPlatilloDto;
    // Validar nombre único
    const exists = await this.platilloRepository.findOne({ where: { nombre } });
    if (exists) throw new ConflictException('Ya existe un platillo con ese nombre');
    // Crear platillo
    const platillo = this.platilloRepository.create({ nombre, descripcion });
    await this.platilloRepository.save(platillo);
    // Crear ingredientes
    for (const ing of ingredientes) {
      const ingrediente = await this.ingredienteRepository.findOne({ where: { id: ing.ingredienteId } });
      if (!ingrediente) throw new NotFoundException(`Ingrediente con ID ${ing.ingredienteId} no encontrado`);
      const pi = this.platilloIngredienteRepository.create({
        platillo,
        ingrediente,
        cantidad: ing.cantidad,
        unidad: ing.unidad || 'g',
      });
      await this.platilloIngredienteRepository.save(pi);
    }
    return this.findOne(platillo.id);
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
      relations: ['ingredientes', 'ingredientes.ingrediente'],
    });
    if (!platillo) throw new NotFoundException(`Platillo con ID ${id} no encontrado`);
    return platillo;
  }

  async update(id: string, updatePlatilloDto: UpdatePlatilloDto) {
    const platillo = await this.findOne(id, true);
    const { nombre, descripcion, ingredientes } = updatePlatilloDto;
    if (nombre) platillo.nombre = nombre;
    if (descripcion) platillo.descripcion = descripcion;
    await this.platilloRepository.save(platillo);
    if (ingredientes && ingredientes.length > 0) {
      await this.platilloIngredienteRepository.delete({ platillo: { id } });
      for (const ing of ingredientes) {
        const ingrediente = await this.ingredienteRepository.findOne({ where: { id: ing.ingredienteId } });
        if (!ingrediente) throw new NotFoundException(`Ingrediente con ID ${ing.ingredienteId} no encontrado`);
        const pi = this.platilloIngredienteRepository.create({
          platillo,
          ingrediente,
          cantidad: ing.cantidad,
          unidad: ing.unidad || 'g',
        });
        await this.platilloIngredienteRepository.save(pi);
      }
    }
    return this.findOne(platillo.id);
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
