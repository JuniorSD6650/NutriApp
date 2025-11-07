import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProfilesService } from '../profiles/profiles.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull, Not } from 'typeorm';
import { RegistroConsumo } from './entities/registro-consumo.entity';
import { CreateRegistroConsumoDto } from './dto/create-registro-consumo.dto';
import { QueryRegistroConsumoDto } from './dto/query-registro-consumo.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RegistrosService {
  constructor(
    @InjectRepository(RegistroConsumo)
    private readonly registroConsumoRepository: Repository<RegistroConsumo>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly profilesService: ProfilesService,
  ) {}
  /**
   * Permite a un médico ver el resumen diario de un paciente si es su dueño
   */
  async getResumenDiarioPorMedico(medicoId: string, pacienteId: string, fecha: string) {
    // Verificar propiedad
    const esDueno = await this.profilesService.esDuenoDePaciente(Number(medicoId), Number(pacienteId));
    if (!esDueno) throw new ForbiddenException('No autorizado para ver el diario de este paciente');
    // Buscar registros del paciente en la fecha
    // Convertir fecha string a Date para la consulta
    const fechaDate = new Date(fecha);
    return this.registroConsumoRepository.find({
      where: { usuario: { id: pacienteId }, fecha: fechaDate },
      order: { fecha: 'DESC' },
    });
  }

  async create(userId: string, dto: CreateRegistroConsumoDto, fotoPath: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const registro = this.registroConsumoRepository.create({
      usuario: user,
      tipo_comida: dto.tipo_comida,
      descripcion: dto.descripcion,
      foto: fotoPath,
    });
    return this.registroConsumoRepository.save(registro);
  }

  async findAll(userId: string, query: QueryRegistroConsumoDto) {
    const { page = 1, limit = 5, tipo_comida } = query;
    const skip = (page - 1) * limit;
    const where: any = { usuario: { id: userId } };
    if (tipo_comida) where.tipo_comida = tipo_comida;
    const [data, total] = await this.registroConsumoRepository.findAndCount({
      where,
      take: limit,
      skip,
      order: { fecha: 'DESC' },
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(userId: string, id: string) {
    const registro = await this.registroConsumoRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    if (!registro) throw new NotFoundException('Registro no encontrado');
    if (registro.usuario.id !== userId) throw new ForbiddenException('No tienes acceso a este registro');
    return registro;
  }
}
