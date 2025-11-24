// src/ingredientes/ingredientes.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, IsNull, Like, Not } from 'typeorm';
import { Ingrediente } from './entities/ingrediente.entity';
import { Nutriente } from './entities/nutriente.entity';
import { IngredienteNutriente } from './entities/ingrediente-nutriente.entity';
import { CreateIngredienteDto } from './dto/create-ingrediente.dto';
import { UpdateIngredienteDto } from './dto/update-ingrediente.dto';
import { QueryIngredienteDto } from './dto/query-ingrediente.dto';
import { FiltroEstado } from '../common/enums/filtro-estado.enum'; // <-- IMPORTAR

@Injectable()
export class IngredientesService {
    async addNutrienteToIngrediente(ingredienteId: string, nutrienteId: string, value_per_100g: number) {
      const ingrediente = await this.findOne(ingredienteId);
      const nutriente = await this.nutrienteRepository.findOneBy({ id: nutrienteId });
      if (!nutriente) {
        throw new NotFoundException(`Nutriente con ID ${nutrienteId} no encontrado`);
      }
      // Verificar si ya existe la relación
      const existe = await this.ingredienteNutrienteRepository.findOne({
        where: { ingrediente: { id: ingredienteId }, nutriente: { id: nutrienteId } }
      });
      if (existe) {
        throw new ConflictException('El nutriente ya está asociado a este ingrediente');
      }
      const nuevaRelacion = this.ingredienteNutrienteRepository.create({
        ingrediente,
        nutriente,
        value_per_100g,
      });
      await this.ingredienteNutrienteRepository.save(nuevaRelacion);
      return this.findOne(ingredienteId);
    }

    async removeNutrienteFromIngrediente(ingredienteId: string, nutrienteId: string) {
      const ingrediente = await this.findOne(ingredienteId);
      const relacion = await this.ingredienteNutrienteRepository.findOne({
        where: { ingrediente: { id: ingredienteId }, nutriente: { id: nutrienteId } }
      });
      if (!relacion) {
        throw new NotFoundException('La relación ingrediente-nutriente no existe');
      }
      await this.ingredienteNutrienteRepository.remove(relacion);
      return this.findOne(ingredienteId);
    }
  constructor(
    @InjectRepository(Ingrediente)
    private readonly ingredienteRepository: Repository<Ingrediente>,
    @InjectRepository(Nutriente)
    private readonly nutrienteRepository: Repository<Nutriente>,
    @InjectRepository(IngredienteNutriente)
    private readonly ingredienteNutrienteRepository: Repository<IngredienteNutriente>,
    private readonly dataSource: DataSource,
  ) { }

  // ... (create sigue igual) ...
  async create(createIngredienteDto: CreateIngredienteDto) {
    const { name, nutrientes } = createIngredienteDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newIngrediente = this.ingredienteRepository.create({ name });
      await queryRunner.manager.save(newIngrediente);
      for (const nutrienteDto of nutrientes) {
        const nutriente = await this.nutrienteRepository.findOneBy({
          id: nutrienteDto.nutrienteId
        });
        if (!nutriente) {
          throw new NotFoundException(`Nutriente con ID ${nutrienteDto.nutrienteId} no encontrado`);
        }
        const newIngredienteNutriente = this.ingredienteNutrienteRepository.create({
          ingrediente: newIngrediente,
          nutriente: nutriente,
          value_per_100g: nutrienteDto.value,
        });
        await queryRunner.manager.save(newIngredienteNutriente);
      }
      await queryRunner.commitTransaction();
      return this.findOne(newIngrediente.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(`Ya existe un ingrediente con el nombre '${name}'`);
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(queryIngredienteDto: QueryIngredienteDto) {
    const {
      page = 1,
      limit = 5,
      name, // El parámetro `name` ahora está definido en el DTO
      search,
      estado = FiltroEstado.ACTIVO,
    } = queryIngredienteDto;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (name && name.trim().length > 0) {
      where.name = Like(`%${name.trim()}%`);
    }

    if (search && search.trim().length > 0) {
      where.name = Like(`%${search.trim()}%`);
    }

    if (estado === FiltroEstado.ACTIVO) {
      where.deletedAt = IsNull();
    } else if (estado === FiltroEstado.INACTIVO) {
      where.deletedAt = Not(IsNull());
    }

    const [data, total] = await this.ingredienteRepository.findAndCount({
      where,
      withDeleted: estado !== FiltroEstado.ACTIVO,
      relations: ['nutrientes', 'nutrientes.nutriente'],
      take: limit,
      skip,
      order: {
        createdAt: 'DESC',
      },
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

    const ingrediente = await this.ingredienteRepository.findOne({
      where: where,
      withDeleted: includeInactive,
      relations: ['nutrientes', 'nutrientes.nutriente'],
    });
    if (!ingrediente) {
      throw new NotFoundException(`Ingrediente con ID ${id} no encontrado`);
    }
    return ingrediente;
  }

  // ... (update sigue igual) ...
  async update(id: string, updateIngredienteDto: UpdateIngredienteDto) {
    const { name, nutrientes } = updateIngredienteDto;
    const ingrediente = await this.findOne(id);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (name) {
        ingrediente.name = name;
        await queryRunner.manager.save(ingrediente);
      }
      if (nutrientes && nutrientes.length > 0) {
        await queryRunner.manager.delete(IngredienteNutriente, { ingrediente: { id } });
        for (const nutrienteDto of nutrientes) {
          const nutriente = await this.nutrienteRepository.findOneBy({ id: nutrienteDto.nutrienteId });
          if (!nutriente) throw new NotFoundException(`Nutriente con ID ${nutrienteDto.nutrienteId} no encontrado`);
          const newIngredienteNutriente = this.ingredienteNutrienteRepository.create({
            ingrediente: ingrediente,
            nutriente: nutriente,
            value_per_100g: nutrienteDto.value,
          });
          await queryRunner.manager.save(newIngredienteNutriente);
        }
      }
      await queryRunner.commitTransaction();
      return this.findOne(ingrediente.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(`Ya existe un ingrediente con el nombre '${name}'`);
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deactivate(id: string) {
    const ingrediente = await this.findOne(id);
    await this.ingredienteRepository.softDelete(id);
    return { message: `Ingrediente ${ingrediente.name} desactivado.` };
  }

  async restore(id: string) {
    const ingrediente = await this.findOne(id, true); // Buscarlo incluso si está inactivo
    if (!ingrediente.deletedAt) {
      throw new ConflictException(`El ingrediente ${ingrediente.name} ya está activo.`);
    }
    await this.ingredienteRepository.restore(id);
    return { message: `Ingrediente ${ingrediente.name} activado.` };
  }

  async remove(id: string, confirmName: string) {
    const ingrediente = await this.findOne(id, true);

    if (ingrediente.name !== confirmName) {
      throw new BadRequestException(`El nombre de confirmación '${confirmName}' no coincide con '${ingrediente.name}'.`);
    }

    await this.ingredienteRepository.remove(ingrediente);
    return { message: `Ingrediente ${ingrediente.name} y sus relaciones han sido eliminados permanentemente.` };
  }
}