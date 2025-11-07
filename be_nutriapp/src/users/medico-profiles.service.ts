import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, Like } from 'typeorm';
import { MedicoProfile } from './entities/medico-profile.entity';
import { QueryMedicoProfileDto } from './dto/query-medico-profile.dto';
import { CreateMedicoProfileDto } from './dto/create-medico-profile.dto';
import { UpdateMedicoProfileDto } from './dto/update-medico-profile.dto';
import { FiltroEstado } from '../common/enums/filtro-estado.enum';

@Injectable()
export class MedicoProfilesService {
  constructor(
    @InjectRepository(MedicoProfile)
    private readonly medicoProfileRepository: Repository<MedicoProfile>,
  ) {}

  async findAll(query: QueryMedicoProfileDto) {
    const { page = 1, limit = 5, search, estado = FiltroEstado.ACTIVO } = query;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) where.especialidad = Like(`%${search}%`);
    if (estado === FiltroEstado.ACTIVO) where.deletedAt = IsNull();
    else if (estado === FiltroEstado.INACTIVO) where.deletedAt = Not(IsNull());
    const [data, total] = await this.medicoProfileRepository.findAndCount({
      where,
      withDeleted: (estado !== FiltroEstado.ACTIVO),
      relations: ['user'],
      take: limit,
      skip,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, includeInactive = false) {
    const where: any = { id };
    if (!includeInactive) where.deletedAt = IsNull();
    const medico = await this.medicoProfileRepository.findOne({
      where,
      withDeleted: includeInactive,
      relations: ['user'],
    });
    if (!medico) throw new NotFoundException(`MedicoProfile con ID ${id} no encontrado`);
    return medico;
  }

  async create(dto: CreateMedicoProfileDto) {
    try {
      const entity = this.medicoProfileRepository.create(dto);
      return await this.medicoProfileRepository.save(entity);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
        throw new ConflictException('Ya existe un perfil de médico con esos datos');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateMedicoProfileDto) {
    const medico = await this.findOne(id, true);
    Object.assign(medico, dto);
    try {
      return await this.medicoProfileRepository.save(medico);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
        throw new ConflictException('Ya existe un perfil de médico con esos datos');
      }
      throw error;
    }
  }

  async deactivate(id: string) {
    const medico = await this.findOne(id);
    await this.medicoProfileRepository.softDelete(id);
    return { message: `Perfil de médico desactivado.` };
  }

  async restore(id: string) {
    const medico = await this.findOne(id, true);
    if (!medico.deletedAt) throw new ConflictException('El perfil ya está activo');
    await this.medicoProfileRepository.restore(id);
    return { message: `Perfil de médico restaurado.` };
  }

  async remove(id: string, confirmName: string) {
    const medico = await this.findOne(id, true);
    if (medico.user?.name !== confirmName) {
      throw new BadRequestException(`El nombre de confirmación '${confirmName}' no coincide con '${medico.user?.name}'.`);
    }
    await this.medicoProfileRepository.remove(medico);
    return { message: `Perfil de médico eliminado permanentemente.` };
  }
}
