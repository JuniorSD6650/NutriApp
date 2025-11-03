import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { RegistroComida } from './entities/registro-comida.entity';
import { RegistroTamizaje } from './entities/registro-tamizaje.entity';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

interface MealAnalysisResponse {
  hierro: number;
  calorias: number;
  nutrientes: object;
}

interface BloodTestAnalysisResponse {
  hemoglobina: number;
  interpretacion: string;
}

@Injectable()
export class RegistrosService {
  constructor(
    @InjectRepository(RegistroComida)
    private readonly comidaRepository: Repository<RegistroComida>,
    @InjectRepository(RegistroTamizaje)
    private readonly tamizajeRepository: Repository<RegistroTamizaje>,
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

  async analyzeBloodTest(file: Express.Multer.File, ninoId: string) {
    try {
      // Similar al análisis de comida, pero para tamizaje
      const formData = new FormData();
      // Convertir buffer a Uint8Array para compatibilidad
      const uint8Array = new Uint8Array(file.buffer);
      const blob = new Blob([uint8Array], { type: file.mimetype });
      formData.append('file', blob, file.originalname);

      const aiBackendUrl = this.configService.get('AI_BACKEND_URL') || 'http://localhost:8000';
      
      const response: AxiosResponse<BloodTestAnalysisResponse> = await firstValueFrom(
        this.httpService.post(`${aiBackendUrl}/analyze/blood`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      );

      const { hemoglobina, interpretacion } = response.data;

      const url_foto = `temp_storage/${Date.now()}_${file.originalname}`;

      const registro = this.tamizajeRepository.create({
        url_foto,
        resultado_hemoglobina: hemoglobina,
        interpretacion,
        nino: { id: ninoId } as any,
      });

      return this.tamizajeRepository.save(registro);
    } catch (error) {
      throw new BadRequestException('Error al analizar la imagen de tamizaje');
    }
  }

  async getRegistrosComida(ninoId: string) {
    return this.comidaRepository.find({
      where: { nino: { id: ninoId } },
      order: { fecha: 'DESC' },
    });
  }

  async getRegistrosTamizaje(ninoId: string) {
    return this.tamizajeRepository.find({
      where: { nino: { id: ninoId } },
      order: { fecha: 'DESC' },
    });
  }
}
