import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { RegistroComida } from './entities/registro-comida.entity';
import { RegistroDeteccionTemprana } from './entities/registro-deteccion-temprana.entity';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

interface MealAnalysisResponse {
  hierro: number;
  calorias: number;
  nutrientes: object;
}

interface EyeDetectionAnalysisResponse {
  confianza_ia: number;
  resultado_ia: string;
  nivel_alerta: string;
  parametros_detectados: object;
  observaciones: string;
}

@Injectable()
export class RegistrosService {
  constructor(
    @InjectRepository(RegistroComida)
    private readonly comidaRepository: Repository<RegistroComida>,
    @InjectRepository(RegistroDeteccionTemprana)
    private readonly deteccionTempranaRepository: Repository<RegistroDeteccionTemprana>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async analyzeMeal(file: Express.Multer.File, ninoId: string) {
    try {
      // Preparar FormData para enviar al backend de IA
      const formData = new FormData();
      // Convertir buffer a Uint8Array para compatibilidad
      const uint8Array = new Uint8Array(file.buffer);
      const blob = new Blob([uint8Array], { type: file.mimetype });
      formData.append('file', blob, file.originalname);

      // URL del backend de IA (Python)
      const aiBackendUrl = this.configService.get('AI_BACKEND_URL') || 'http://localhost:8000';
      
      // Llamar al backend de IA
      const response: AxiosResponse<MealAnalysisResponse> = await firstValueFrom(
        this.httpService.post(`${aiBackendUrl}/analyze/food`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      );

      const { hierro, calorias, nutrientes } = response.data;

      // TODO: Subir imagen a servicio de almacenamiento (AWS S3, Cloudinary, etc.)
      // Por ahora, usaremos una URL temporal
      const url_foto = `temp_storage/${Date.now()}_${file.originalname}`;

      // Crear registro en la base de datos
      const registro = this.comidaRepository.create({
        url_foto,
        hierro_mg: hierro,
        calorias,
        json_nutrientes: nutrientes,
        nino: { id: ninoId } as any,
      });

      return this.comidaRepository.save(registro);
    } catch (error) {
      throw new BadRequestException('Error al analizar la imagen de comida');
    }
  }

  async analyzeEyeDetection(file: Express.Multer.File, ninoId: string) {
    try {
      // Análisis de detección temprana por mucosa ocular
      const formData = new FormData();
      // Convertir buffer a Uint8Array para compatibilidad
      const uint8Array = new Uint8Array(file.buffer);
      const blob = new Blob([uint8Array], { type: file.mimetype });
      formData.append('file', blob, file.originalname);

      const aiBackendUrl = this.configService.get('AI_BACKEND_URL') || 'http://localhost:8000';
      
      const response: AxiosResponse<EyeDetectionAnalysisResponse> = await firstValueFrom(
        this.httpService.post(`${aiBackendUrl}/analyze/eye-detection`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      );

      const { confianza_ia, resultado_ia, nivel_alerta, parametros_detectados, observaciones } = response.data;

      const url_foto = `temp_storage/${Date.now()}_${file.originalname}`;

      const registro = this.deteccionTempranaRepository.create({
        url_foto,
        confianza_ia,
        resultado_ia,
        nivel_alerta,
        parametros_detectados,
        observaciones,
        nino: { id: ninoId } as any,
      });

      return this.deteccionTempranaRepository.save(registro);
    } catch (error) {
      throw new BadRequestException('Error al analizar la imagen de detección temprana');
    }
  }

  async getRegistrosComida(ninoId: string) {
    return this.comidaRepository.find({
      where: { nino: { id: ninoId } },
      order: { fecha: 'DESC' },
    });
  }

  async getRegistrosDeteccionTemprana(ninoId: string) {
    return this.deteccionTempranaRepository.find({
      where: { nino: { id: ninoId } },
      order: { fecha: 'DESC' },
    });
  }
}
