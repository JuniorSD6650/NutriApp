import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Nino } from '../ninos/entities/nino.entity';
import { RegistroComida } from '../registros/entities/registro-comida.entity';
import { RegistroTamizaje } from '../registros/entities/registro-tamizaje.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Nino)
    private readonly ninoRepository: Repository<Nino>,
    @InjectRepository(RegistroComida)
    private readonly comidaRepository: Repository<RegistroComida>,
    @InjectRepository(RegistroTamizaje)
    private readonly tamizajeRepository: Repository<RegistroTamizaje>,
  ) {}

  async getGeneralStats() {
    const totalMadres = await this.userRepository.count({ where: { rol: 'madre' } });
    const totalNinos = await this.ninoRepository.count();
    const totalRegistrosComida = await this.comidaRepository.count();
    const totalRegistrosTamizaje = await this.tamizajeRepository.count();

    return {
      totalMadres,
      totalNinos,
      totalRegistrosComida,
      totalRegistrosTamizaje,
    };
  }

  async getNutritionAverages() {
    const result = await this.comidaRepository
      .createQueryBuilder('registro')
      .select('AVG(registro.hierro_mg)', 'promedioHierro')
      .addSelect('AVG(registro.calorias)', 'promedioCalorias')
      .getRawOne();

    return {
      promedioHierro: parseFloat(result.promedioHierro) || 0,
      promedioCalorias: parseFloat(result.promedioCalorias) || 0,
    };
  }

  async getHemoglobinStats() {
    const result = await this.tamizajeRepository
      .createQueryBuilder('registro')
      .select('AVG(registro.resultado_hemoglobina)', 'promedioHemoglobina')
      .addSelect('registro.interpretacion', 'interpretacion')
      .addSelect('COUNT(*)', 'cantidad')
      .groupBy('registro.interpretacion')
      .getRawMany();

    const promedioGeneral = await this.tamizajeRepository
      .createQueryBuilder('registro')
      .select('AVG(registro.resultado_hemoglobina)', 'promedio')
      .getRawOne();

    return {
      promedioGeneral: parseFloat(promedioGeneral.promedio) || 0,
      distribucion: result.map(item => ({
        interpretacion: item.interpretacion,
        cantidad: parseInt(item.cantidad),
        promedio: parseFloat(item.promedioHemoglobina) || 0,
      })),
    };
  }

  async getRecentActivity() {
    const recentFood = await this.comidaRepository
      .createQueryBuilder('registro')
      .leftJoinAndSelect('registro.nino', 'nino')
      .leftJoinAndSelect('nino.madre', 'madre')
      .orderBy('registro.fecha', 'DESC')
      .limit(10)
      .getMany();

    const recentBlood = await this.tamizajeRepository
      .createQueryBuilder('registro')
      .leftJoinAndSelect('registro.nino', 'nino')
      .leftJoinAndSelect('nino.madre', 'madre')
      .orderBy('registro.fecha', 'DESC')
      .limit(10)
      .getMany();

    return {
      registrosComidaRecientes: recentFood,
      registrosTamizajeRecientes: recentBlood,
    };
  }

  async getAlertsAndRecommendations() {
    // Niños con bajo hierro (menos de 6mg promedio)
    const lowIronChildren = await this.comidaRepository
      .createQueryBuilder('registro')
      .leftJoinAndSelect('registro.nino', 'nino')
      .leftJoinAndSelect('nino.madre', 'madre')
      .select('nino.id', 'ninoId')
      .addSelect('nino.nombre', 'ninoNombre')
      .addSelect('madre.nombre', 'madreNombre')
      .addSelect('AVG(registro.hierro_mg)', 'promedioHierro')
      .groupBy('nino.id, nino.nombre, madre.nombre')
      .having('AVG(registro.hierro_mg) < :threshold', { threshold: 6 })
      .getRawMany();

    // Niños con hemoglobina preocupante
    const anemicChildren = await this.tamizajeRepository
      .createQueryBuilder('registro')
      .leftJoinAndSelect('registro.nino', 'nino')
      .leftJoinAndSelect('nino.madre', 'madre')
      .where('registro.interpretacion IN (:...levels)', { levels: ['moderada', 'severa'] })
      .orderBy('registro.fecha', 'DESC')
      .getMany();

    return {
      alertasBajoHierro: lowIronChildren.map(item => ({
        ninoId: item.ninoId,
        ninoNombre: item.ninoNombre,
        madreNombre: item.madreNombre,
        promedioHierro: parseFloat(item.promedioHierro),
      })),
      alertasAnemia: anemicChildren.map(registro => ({
        ninoId: registro.nino.id,
        ninoNombre: registro.nino.nombre,
        madreNombre: registro.nino.madre.nombre,
        hemoglobina: registro.resultado_hemoglobina,
        interpretacion: registro.interpretacion,
        fecha: registro.fecha,
      })),
    };
  }

  async getAllUsers() {
    return this.userRepository.find({
      select: ['id', 'nombre', 'email', 'rol', 'created_at'],
      order: { created_at: 'DESC' },
    });
  }

  async getAllChildren() {
    return this.ninoRepository.find({
      relations: ['madre'],
      select: {
        id: true,
        nombre: true,
        fecha_nacimiento: true,
        genero: true,
        peso_actual: true,
        altura_actual: true,
        created_at: true,
        madre: {
          id: true,
          nombre: true,
          email: true,
        },
      },
      order: { created_at: 'DESC' },
    });
  }
}
