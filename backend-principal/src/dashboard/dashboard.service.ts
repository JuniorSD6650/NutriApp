import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Nino } from '../ninos/entities/nino.entity';
import { RegistroDeteccionTemprana } from '../registros/entities/registro-deteccion-temprana.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Nino)
    private readonly ninoRepository: Repository<Nino>,
    @InjectRepository(RegistroDeteccionTemprana)
    private readonly deteccionTempranaRepository: Repository<RegistroDeteccionTemprana>,
  ) {}

  async getStats() {
    const [totalUsers, totalChildren, totalEarlyDetections] = await Promise.all([
      this.userRepository.count(),
      this.ninoRepository.count(),
      this.deteccionTempranaRepository.count(),
    ]);

    // Solo alertas de detecciones con nivel alto
    const alerts = await this.deteccionTempranaRepository.find({
      where: { nivel_alerta: 'alta' },
      relations: ['nino'],
      order: { fecha: 'DESC' },
      take: 10,
    });

    return {
      totalUsers,
      totalChildren,
      totalMealRecords: 0, // Ya no hay registros de comida
      totalEarlyDetections,
      recentActivity: [], // Ya no hay actividad reciente de comidas
      alerts: alerts.map(alert => ({
        message: `${alert.nino.nombre}: ${alert.observaciones}`,
        date: alert.fecha,
        level: alert.nivel_alerta,
      })),
    };
  }

  async getNutritionData() {
    // Retornar datos vacíos ya que no hay registros de comida
    return {
      totalMeals: 0,
      averageIron: '0.0',
      averageCalories: '0',
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
      order: { nombre: 'ASC' },
    });
  }

  async getAllDetections() {
    return this.deteccionTempranaRepository.find({
      relations: ['nino'],
      order: { fecha: 'DESC' },
      take: 50,
    });
  }

  async getAllDetectionsPaginated(page: number = 1, limit: number = 10, search?: string, nivelAlerta?: string): Promise<{
    data: RegistroDeteccionTemprana[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryBuilder = this.deteccionTempranaRepository
      .createQueryBuilder('detection')
      .leftJoinAndSelect('detection.nino', 'nino')
      .orderBy('detection.fecha', 'DESC');

    // Aplicar filtro de búsqueda por nombre del niño
    if (search && search.trim()) {
      queryBuilder.where('LOWER(nino.nombre) LIKE LOWER(:search)', { search: `%${search.trim()}%` });
    }

    // Aplicar filtro por nivel de alerta
    if (nivelAlerta && nivelAlerta !== '') {
      queryBuilder.andWhere('detection.nivel_alerta = :nivelAlerta', { nivelAlerta });
    }

    // Contar total de registros
    const total = await queryBuilder.getCount();

    // Aplicar paginación
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Obtener registros paginados
    const data = await queryBuilder.getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
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
