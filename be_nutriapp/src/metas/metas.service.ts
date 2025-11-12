import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetaDiaria } from './entities/meta-diaria.entity';
import { CreateMetaDto } from './dto/create-meta.dto';
import { UsersService } from '../users/users.service';
import { ProfilesService } from '../profiles/profiles.service';

@Injectable()
export class MetasService {
    async actualizarMeta(id: string, body: { hierroConsumido?: number; completada?: boolean }) {
      const meta = await this.metaRepository.findOne({ where: { id } });
      if (!meta) throw new NotFoundException('Meta no encontrada');
      if (typeof body.hierroConsumido === 'number') meta.hierroConsumido = body.hierroConsumido;
      if (typeof body.completada === 'boolean') meta.completada = body.completada;
      return this.metaRepository.save(meta);
    }
  constructor(
    @InjectRepository(MetaDiaria)
    private readonly metaRepository: Repository<MetaDiaria>,
    private readonly usersService: UsersService,
    private readonly profilesService: ProfilesService,
  ) {}

  async crearMeta(medicoId: string, dto: CreateMetaDto) {
    // Verificar que el paciente existe
    const paciente = await this.usersService.findOne(dto.pacienteId);
    if (!paciente) throw new NotFoundException('Paciente no encontrado');
    // Verificar que el médico es dueño del paciente
    const esDueno = await this.profilesService.esDuenoDePaciente(medicoId, dto.pacienteId);
    if (!esDueno) throw new ForbiddenException('No autorizado para asignar metas a este paciente');
    // Crear la meta
    const meta = this.metaRepository.create({
      fecha: dto.fecha,
      hierroObjetivo: dto.hierroObjetivo,
      completada: false,
      paciente,
      medico: { id: medicoId },
    });
    return this.metaRepository.save(meta);
  }

  async obtenerMetasPorPaciente(pacienteId: string) {
    return this.metaRepository.find({ where: { paciente: { id: pacienteId } }, order: { fecha: 'DESC' } });
  }

  async obtenerMetaActivaPorPaciente(pacienteId: string) {
    // Meta activa: la más reciente no completada
    const metas = await this.metaRepository.find({
      where: { paciente: { id: pacienteId }, completada: false },
      order: { fecha: 'DESC' },
      take: 1,
    });
    return metas[0] || null;
  }
}
