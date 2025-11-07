import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Verifica si el médico con id medicoId es dueño del paciente con id pacienteId
   */
  async esDuenoDePaciente(medicoId: number, pacienteId: number): Promise<boolean> {
    const medico = await this.userRepository.findOne({
      where: { id: String(medicoId) },
      relations: ['pacientes'],
    });
    if (!medico) return false;
    return medico.pacientes.some((p) => p.id === String(pacienteId));
  }
}
