import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, Like } from 'typeorm';
import { PacienteProfile } from './entities/paciente-profile.entity';
import { QueryPacienteProfileDto } from './dto/query-paciente-profile.dto';
import { CreatePacienteProfileDto } from './dto/create-paciente-profile.dto';
import { UpdatePacienteProfileDto } from './dto/update-paciente-profile.dto';
import { FiltroEstado } from '../common/enums/filtro-estado.enum';

@Injectable()
export class PacienteProfilesService {
  constructor(
    @InjectRepository(PacienteProfile)
    private readonly pacienteProfileRepository: Repository<PacienteProfile>,
  ) {}

  async findAll(query: QueryPacienteProfileDto) {
    const { page = 1, limit = 5, search, estado = FiltroEstado.ACTIVO } = query;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) where.alergias_alimentarias = Like(`%${search}%`);
    if (estado === FiltroEstado.ACTIVO) where.deletedAt = IsNull();
    else if (estado === FiltroEstado.INACTIVO) where.deletedAt = Not(IsNull());
    const [data, total] = await this.pacienteProfileRepository.findAndCount({
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
    const paciente = await this.pacienteProfileRepository.findOne({
      where,
      withDeleted: includeInactive,
      relations: ['user'],
    });
    if (!paciente) throw new NotFoundException(`PacienteProfile con ID ${id} no encontrado`);
    return paciente;
  }

  async create(dto: CreatePacienteProfileDto) {
    try {
      const entity = this.pacienteProfileRepository.create(dto);
      return await this.pacienteProfileRepository.save(entity);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
        throw new ConflictException('Ya existe un perfil de paciente con esos datos');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdatePacienteProfileDto) {
    const paciente = await this.findOne(id, true);
    Object.assign(paciente, dto);
    try {
      return await this.pacienteProfileRepository.save(paciente);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
        throw new ConflictException('Ya existe un perfil de paciente con esos datos');
      }
      throw error;
    }
  }

  async deactivate(id: string) {
    const paciente = await this.findOne(id);
    await this.pacienteProfileRepository.softDelete(id);
    return { message: `Perfil de paciente desactivado.` };
  }

  async restore(id: string) {
    const paciente = await this.findOne(id, true);
    if (!paciente.deletedAt) throw new ConflictException('El perfil ya está activo');
    await this.pacienteProfileRepository.restore(id);
    return { message: `Perfil de paciente restaurado.` };
  }

  async remove(id: string, confirmName: string) {
    const paciente = await this.findOne(id, true);
    if (paciente.user?.name !== confirmName) {
      throw new BadRequestException(`El nombre de confirmación '${confirmName}' no coincide con '${paciente.user?.name}'.`);
    }
    await this.pacienteProfileRepository.remove(paciente);
    return { message: `Perfil de paciente eliminado permanentemente.` };
  }
}
