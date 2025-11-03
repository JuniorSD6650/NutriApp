import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Nino } from '../ninos/entities/nino.entity';
import { RegistroComida, NutrientesJson } from '../registros/entities/registro-comida.entity';
import { RegistroDeteccionTemprana } from '../registros/entities/registro-deteccion-temprana.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Nino)
    private readonly ninoRepository: Repository<Nino>,
    @InjectRepository(RegistroComida)
    private readonly comidaRepository: Repository<RegistroComida>,
    @InjectRepository(RegistroDeteccionTemprana)
    private readonly deteccionTempranaRepository: Repository<RegistroDeteccionTemprana>,
  ) {}

  async getStats() {
    const [totalUsers, totalChildren, totalMealRecords, totalEarlyDetections] = await Promise.all([
      this.userRepository.count(),
      this.ninoRepository.count(),
      this.comidaRepository.count(),
      this.deteccionTempranaRepository.count(),
    ]);

    // Get recent activity (last 5 meal records)
    const recentActivity = await this.comidaRepository.find({
      relations: ['nino'],
      order: { fecha: 'DESC' },
      take: 5,
    });

    // Get alerts from early detection
    const earlyDetectionAlerts = await this.deteccionTempranaRepository
      .createQueryBuilder('deteccion')
      .leftJoinAndSelect('deteccion.nino', 'nino')
      .where('deteccion.nivel_alerta IN (:...levels)', { levels: ['media', 'alta'] })
      .orderBy('deteccion.fecha', 'DESC')
      .take(10)
      .getMany();

    const formattedActivity = recentActivity.map(record => ({
      description: `Registro de comida para ${record.nino.nombre}`,
      date: record.fecha,
      type: 'meal',
    }));

    const formattedAlerts = earlyDetectionAlerts.map(alert => ({
      message: `Detección IA: ${alert.nino.nombre} - ${alert.resultado_ia} (${alert.confianza_ia}% confianza)`,
      severity: alert.nivel_alerta,
      date: alert.fecha,
      type: 'early_detection',
    }));

    return {
      totalUsers,
      totalChildren,
      totalMealRecords,
      totalEarlyDetections,
      recentActivity: formattedActivity,
      alerts: formattedAlerts,
    };
  }

  async getEarlyDetectionProgressData() {
    // Datos de progreso de detección temprana por mes
    const progressData = await this.deteccionTempranaRepository
      .createQueryBuilder('deteccion')
      .leftJoinAndSelect('deteccion.nino', 'nino')
      .orderBy('deteccion.fecha', 'ASC')
      .getMany();

    // Agrupar por mes y calcular estadísticas
    const monthlyData = {};
    progressData.forEach(record => {
      const monthKey = record.fecha.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          totalDetections: 0,
          normalCount: 0,
          sospechososCount: 0,
          probableAnemiaCount: 0,
          averageConfidence: 0,
          totalConfidence: 0,
        };
      }
      
      monthlyData[monthKey].totalDetections++;
      monthlyData[monthKey][`${record.resultado_ia === 'normal' ? 'normal' : record.resultado_ia === 'sospechoso' ? 'sospechosos' : 'probableAnemia'}Count`]++;
      monthlyData[monthKey].totalConfidence += record.confianza_ia;
    });

    // Calcular promedios finales
    Object.values(monthlyData).forEach((month: any) => {
      month.averageConfidence = Math.round((month.totalConfidence / month.totalDetections) * 10) / 10;
      month.improvementRate = month.totalDetections > 0 ? (month.normalCount / month.totalDetections) * 100 : 0;
    });

    return Object.values(monthlyData).sort((a: any, b: any) => a.month.localeCompare(b.month));
  }

  async getEarlyDetectionDistributionData() {
    // Distribución actual de resultados de detección temprana
    const latestRecords = await this.deteccionTempranaRepository
      .createQueryBuilder('deteccion')
      .leftJoinAndSelect('deteccion.nino', 'nino')
      .where('deteccion.id IN (SELECT MAX(d2.id) FROM registros_deteccion_temprana d2 GROUP BY d2.ninoId)')
      .getMany();

    const distribution = {
      normal: 0,
      sospechoso: 0,
      probable_anemia: 0,
    };

    latestRecords.forEach(record => {
      distribution[record.resultado_ia]++;
    });

    return {
      labels: ['Normal', 'Sospechoso', 'Probable Anemia'],
      data: [distribution.normal, distribution.sospechoso, distribution.probable_anemia],
      colors: ['#10B981', '#F59E0B', '#EF4444'],
    };
  }

  async getNutritionData() {
    const nutritionData = await this.comidaRepository
      .createQueryBuilder('comida')
      .leftJoinAndSelect('comida.nino', 'nino')
      .orderBy('comida.fecha', 'DESC')
      .take(50)
      .getMany();

    return nutritionData.map(record => {
      const nutrientes = record.json_nutrientes as NutrientesJson;
      
      return {
        id: record.id,
        url_foto: record.url_foto,
        fecha: record.fecha,
        hierro_mg: Number(record.hierro_mg),
        calorias: Number(record.calorias),
        json_nutrientes: {
          proteinas: Number(nutrientes?.proteinas) || 0,
          carbohidratos: Number(nutrientes?.carbohidratos) || 0,
          grasas: Number(nutrientes?.grasas) || 0,
          fibra: Number(nutrientes?.fibra) || 0,
          vitamina_c: Number(nutrientes?.vitamina_c) || 0,
          calcio: Number(nutrientes?.calcio) || 0,
        },
        nino: {
          id: record.nino.id,
          nombre: record.nino.nombre,
        },
      };
    });
  }

  async getAllUsers() {
    return this.userRepository.find({
      select: ['id', 'nombre', 'email', 'rol'],
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
        madre: {
          id: true,
          nombre: true,
          email: true,
        },
      },
    });
  }

  async getAllDetections() {
    return this.deteccionTempranaRepository.find({
      relations: ['nino'],
      order: { fecha: 'DESC' },
      select: {
        id: true,
        url_foto: true,
        fecha: true,
        confianza_ia: true,
        resultado_ia: true,
        nivel_alerta: true,
        parametros_detectados: true,
        observaciones: true,
        nino: {
          id: true,
          nombre: true,
        },
      },
    });
  }
}
