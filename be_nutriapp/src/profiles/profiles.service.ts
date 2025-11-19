import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/enums/role.enum';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Verifica si el médico con id medicoId es dueño del paciente con id pacienteId
   */
  async esDuenoDePaciente(medicoId: string, pacienteId: string): Promise<boolean> {
    const medico = await this.userRepository.findOne({
      where: { id: medicoId, role: Role.MEDICO },
      relations: ['medicoProfile', 'medicoProfile.pacientes'],
    });

    if (!medico || !medico.medicoProfile) return false;

    return medico.medicoProfile.pacientes.some(p => p.id === pacienteId);
  }

  // GET /profiles/medicos/:medicoId/pacientes
  async obtenerPacientesDeMedico(medicoId: string) {
    const medico = await this.userRepository.findOne({
      where: { id: medicoId, role: Role.MEDICO },
      relations: ['medicoProfile'],
    });

    if (!medico || !medico.medicoProfile) {
      throw new NotFoundException('Médico no encontrado');
    }

    console.log('🔍 Médico encontrado:', medico.id, medico.email);
    console.log('🔍 MedicoProfile ID:', medico.medicoProfile.id);

    // CORRECCIÓN: Agregar .select() para especificar los campos a cargar
    const pacientes = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.role',
        'pacienteProfile.id',
        'pacienteProfile.fecha_nacimiento',
        'pacienteProfile.peso_inicial_kg',
        'pacienteProfile.altura_cm',
        'pacienteProfile.toma_suplementos_hierro',
      ])
      .leftJoin('user.pacienteProfile', 'pacienteProfile')
      .leftJoin('user.medicoAsignado', 'medicoAsignado')
      .where('user.role = :role', { role: Role.PACIENTE })
      .andWhere('medicoAsignado.id = :medicoProfileId', { medicoProfileId: medico.medicoProfile.id })
      .getMany();

    console.log('👥 Pacientes encontrados:', pacientes.length);

    if (pacientes.length === 0) {
      console.warn('⚠️ No hay pacientes asignados a este médico');
    }

    return pacientes.map(paciente => {
      console.log('📋 Procesando paciente:', paciente.id, paciente.name, paciente.email);
      return {
        id: paciente.id,
        name: paciente.name || 'Sin nombre',
        email: paciente.email || 'Sin email',
        fechaNacimiento: paciente.pacienteProfile?.fecha_nacimiento ?? null,
        pesoInicial: paciente.pacienteProfile?.peso_inicial_kg ?? null,
        alturaCm: paciente.pacienteProfile?.altura_cm ?? null,
        tomaSuplementos: paciente.pacienteProfile?.toma_suplementos_hierro ?? false,
      };
    });
  }

  // GET /profiles/medicos/:medicoId/estadisticas
  async obtenerEstadisticasMedico(medicoId: string) {
    const medico = await this.userRepository.findOne({
      where: { id: medicoId, role: Role.MEDICO },
      relations: ['medicoProfile'],
    });

    if (!medico || !medico.medicoProfile) {
      throw new NotFoundException('Médico no encontrado');
    }

    // Contar pacientes asignados
    const totalPacientes = await this.userRepository.count({
      where: {
        role: Role.PACIENTE,
        medicoAsignado: { id: medico.medicoProfile.id }
      },
    });

    // Obtener metas de hoy
    const hoy = new Date().toISOString().split('T')[0];
    const metasRepo = this.userRepository.manager.getRepository('MetaDiaria');
    
    const metasHoy = await metasRepo.find({
      where: {
        fecha: hoy,
        medico: { id: medicoId },
      },
    });

    const pacientesConMetaCumplida = metasHoy.filter(meta => meta.completada).length;
    const promedioHierroConsumido = metasHoy.length > 0
      ? metasHoy.reduce((sum, meta) => sum + (meta.hierroConsumido || 0), 0) / metasHoy.length
      : 0;

    return {
      totalPacientes,
      pacientesConMetaCumplida,
      pacientesConMetaPendiente: totalPacientes - pacientesConMetaCumplida,
      promedioHierroConsumido: Math.round(promedioHierroConsumido * 100) / 100,
    };
  }
}
