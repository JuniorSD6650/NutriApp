import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Nino } from '../ninos/entities/nino.entity';
import { RegistroComida } from '../registros/entities/registro-comida.entity';
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

    // Actividad reciente (últimos 10 registros de comida)
    const recentActivity = await this.comidaRepository.find({
      relations: ['nino'],
      order: { fecha: 'DESC' },
      take: 10,
    });

    // Alertas (detecciones con nivel alto)
    const alerts = await this.deteccionTempranaRepository.find({
      where: { nivel_alerta: 'alta' },
      relations: ['nino'],
      order: { fecha: 'DESC' },
      take: 10,
    });

    return {
      totalUsers,
      totalChildren,
      totalMealRecords,
      totalEarlyDetections,
      recentActivity: recentActivity.map(record => ({
        description: `Registro de comida para ${record.nino.nombre}`,
        date: record.fecha,
        hierro: record.hierro_mg,
      })),
      alerts: alerts.map(alert => ({
        message: `${alert.nino.nombre}: ${alert.observaciones}`,
        date: alert.fecha,
        level: alert.nivel_alerta,
      })),
    };
  }

  async getEarlyDetectionProgress() {
    // Obtener datos de los últimos 6 meses agrupados por mes
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const detections = await this.deteccionTempranaRepository
      .createQueryBuilder('detection')
      .where('detection.fecha >= :date', { date: sixMonthsAgo })
      .orderBy('detection.fecha', 'DESC')
      .getMany();

    // Agrupar por mes
    const monthlyData = {};
    detections.forEach(detection => {
      const monthKey = detection.fecha.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          normal: 0,
          sospechosos: 0,
          probableAnemia: 0,
          totalConfidence: 0,
          count: 0,
        };
      }

      monthlyData[monthKey].count++;
      monthlyData[monthKey].totalConfidence += detection.confianza_ia;

      switch (detection.resultado_ia) {
        case 'normal':
          monthlyData[monthKey].normal++;
          break;
        case 'sospechoso':
          monthlyData[monthKey].sospechosos++;
          break;
        case 'probable_anemia':
          monthlyData[monthKey].probableAnemia++;
          break;
      }
    });

    // Convertir a array y calcular métricas
    return Object.keys(monthlyData)
      .sort()
      .map(month => {
        const data = monthlyData[month];
        const improvementRate = data.count > 0 ? (data.normal / data.count) * 100 : 0;
        const averageConfidence = data.count > 0 ? data.totalConfidence / data.count : 0;

        return {
          month,
          improvementRate: Number(improvementRate.toFixed(1)),
          averageConfidence: Number(averageConfidence.toFixed(1)),
          normalCount: data.normal,
          sospechososCount: data.sospechosos,
          probableAnemiaCount: data.probableAnemia,
          total: data.count,
        };
      });
  }

  async getEarlyDetectionDistribution() {
    const [normal, sospechosos, probableAnemia] = await Promise.all([
      this.deteccionTempranaRepository.count({ where: { resultado_ia: 'normal' } }),
      this.deteccionTempranaRepository.count({ where: { resultado_ia: 'sospechoso' } }),
      this.deteccionTempranaRepository.count({ where: { resultado_ia: 'probable_anemia' } }),
    ]);

    return {
      labels: ['Normal', 'Sospechoso', 'Probable Anemia'],
      data: [normal, sospechosos, probableAnemia],
      colors: ['#10B981', '#F59E0B', '#EF4444'],
    };
  }

  async getChildren() {
    return this.ninoRepository.find({
      relations: ['madre'],
      order: { nombre: 'ASC' },
    });
  }
}
