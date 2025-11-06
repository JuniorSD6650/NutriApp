// src/ingredientes/nutrientes/nutrientes.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull, Not } from 'typeorm'; // <-- Importar IsNull, Not
import { Nutriente } from '../entities/nutriente.entity';
import { CreateNutrienteDto } from './dto/create-nutriente.dto';
import { UpdateNutrienteDto } from './dto/update-nutriente.dto';
import { QueryNutrienteDto } from './dto/query-nutriente.dto';
import { FiltroEstado } from '../../common/enums/filtro-estado.enum';

@Injectable()
export class NutrientesService {
  constructor(
    @InjectRepository(Nutriente)
    private readonly nutrienteRepository: Repository<Nutriente>,
  ) { }

  async create(createNutrienteDto: CreateNutrienteDto) {
    try {
      const nutriente = this.nutrienteRepository.create(createNutrienteDto);
      return await this.nutrienteRepository.save(nutriente);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(`Ya existe un nutriente con el nombre '${createNutrienteDto.name}'`);
      }
      throw error;
    }
  }

  async findAll(queryNutrienteDto: QueryNutrienteDto) {
    const {
      page = 1,
      limit = 5,
      search,
      estado = FiltroEstado.ACTIVO // Default
    } = queryNutrienteDto;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.name = Like(`%${search}%`);
    }

    // Lógica de Filtro de Estado
    if (estado === FiltroEstado.ACTIVO) {
      where.deletedAt = IsNull();
    } else if (estado === FiltroEstado.INACTIVO) {
      where.deletedAt = Not(IsNull());
    }

    const [data, total] = await this.nutrienteRepository.findAndCount({
      where: where,
      withDeleted: (estado !== FiltroEstado.ACTIVO), // Incluir borrados si se piden
      take: limit,
      skip: skip,
      order: {
        createdAt: 'DESC' // Ordenar por creación, el más nuevo primero
      }
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, includeInactive: boolean = false) {
    const where: any = { id };
    if (!includeInactive) {
      where.deletedAt = IsNull();
    }

    const nutriente = await this.nutrienteRepository.findOne({
      where,
      withDeleted: includeInactive,
    });

    if (!nutriente) {
      throw new NotFoundException(`Nutriente con ID ${id} no encontrado`);
    }
    return nutriente;
  }

  async update(id: string, updateNutrienteDto: UpdateNutrienteDto) {
    const nutriente = await this.findOne(id); // Solo se pueden editar activos
    try {
      const updatedNutriente = this.nutrienteRepository.merge(nutriente, updateNutrienteDto);
      return await this.nutrienteRepository.save(updatedNutriente);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(`Ya existe un nutriente con el nombre '${updateNutrienteDto.name}'`);
      }
      throw error;
    }
  }

  async deactivate(id: string) {
    const nutriente = await this.findOne(id);
    await this.nutrienteRepository.softDelete(id);
    return { message: `Nutriente ${nutriente.name} desactivado.` };
  }

  async restore(id: string) {
    const nutriente = await this.findOne(id, true);
    if (!nutriente.deletedAt) {
      throw new ConflictException(`El nutriente ${nutriente.name} ya está activo.`);
    }
    await this.nutrienteRepository.restore(id);
    return { message: `Nutriente ${nutriente.name} activado.` };
  }

  async remove(id: string, confirmName: string) {
    const nutriente = await this.nutrienteRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!nutriente) {
      throw new NotFoundException(`Nutriente con ID ${id} no encontrado`);
    }

    if (nutriente.name !== confirmName) {
      throw new BadRequestException(`El nombre de confirmación '${confirmName}' no coincide con '${nutriente.name}'.`);
    }

    await this.nutrienteRepository.remove(nutriente);

    return { message: `Nutriente ${nutriente.name} y todas sus relaciones han sido eliminados permanentemente.` };
  }
}