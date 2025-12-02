import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import axios from 'axios';
import { Platillo } from '../platillos/entities/platillo.entity';
import { RecognizeDishDto } from './dto/recognize-dish.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openaiApiKey: string | undefined;
  private readonly openaiApiUrl = 'https://api.openai.com/v1/chat/completions';
  private readonly maxRequestsPerMinute = 10; // Límite de solicitudes por minuto
  private requestCount = 0;
  private resetTime = Date.now() + 60000;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Platillo)
    private readonly platilloRepository: Repository<Platillo>,
  ) {
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (!this.openaiApiKey || this.openaiApiKey === 'TU_API_KEY_AQUI') {
      this.logger.warn('⚠️ OPENAI_API_KEY no está configurada en el .env');
    }
  }

  private checkRateLimit() {
    const now = Date.now();
    
    // Reiniciar contador cada minuto
    if (now > this.resetTime) {
      this.requestCount = 0;
      this.resetTime = now + 60000;
    }

    // Verificar límite
    if (this.requestCount >= this.maxRequestsPerMinute) {
      throw new BadRequestException(
        `Límite de solicitudes excedido. Máximo ${this.maxRequestsPerMinute} por minuto.`
      );
    }

    this.requestCount++;
  }

  async recognizeDish(dto: RecognizeDishDto) {
    try {
      // Validar configuración
      if (!this.openaiApiKey || this.openaiApiKey === 'TU_API_KEY_AQUI') {
        throw new BadRequestException(
          'OpenAI API Key no está configurada. Por favor contacte al administrador.'
        );
      }

      // Verificar rate limiting
      this.checkRateLimit();

      this.logger.log(`🤖 Iniciando reconocimiento de platillo para ${dto.mealType}`);

      // 1. Obtener todos los platillos activos
      const platillos = await this.platilloRepository.find({
        where: { deletedAt: IsNull() },
        select: ['id', 'nombre'],
        order: { nombre: 'ASC' },
      });

      if (platillos.length === 0) {
        throw new BadRequestException('No hay platillos disponibles en el catálogo');
      }

      // 2. Formatear lista de platillos con numeración
      const platillosString = platillos
        .map((p, index) => `${index + 1}. ${p.nombre}`)
        .join('\n');

      // 3. Determinar tipo de entrada
      const isImage = !!dto.imageBase64;
      const inputType = isImage ? 'imagen' : 'descripción de texto';
      const inputContext = isImage
        ? 'Analiza cuidadosamente la imagen adjunta. Si ves comida real, identifica los alimentos. Si la imagen está vacía, borrosa, o no muestra comida, responde "NINGUNO".'
        : `Analiza la siguiente descripción: "${dto.description}"`;

      // 4. Construir prompt optimizado
      const prompt = `TAREA: Identificar platillo exacto de un catálogo basándose en ${isImage ? 'una imagen' : 'una descripción textual'}.

⚠️ REGLAS ESTRICTAS DE VALIDACIÓN:
- Si la imagen NO muestra comida clara y reconocible → responde "NINGUNO"
- Si la imagen está vacía, borrosa o es irrelevante → responde "NINGUNO"
- Si la descripción es vaga o no describe comida específica → responde "NINGUNO"
- Si ningún platillo del catálogo coincide razonablemente (>50% similitud) → responde "NINGUNO"
- Solo responde con un platillo si estás SEGURO de la coincidencia

CONTEXTO:
- Tipo de comida esperada: ${dto.mealType}
- Método de entrada: ${inputType}
- Total de platillos en catálogo: ${platillos.length}

INSTRUCCIONES:
1. ${inputContext}
2. Si identificas comida real, compárala con el catálogo de platillos disponibles.
3. Verifica que el tipo de comida coincida con "${dto.mealType}".
4. Selecciona ÚNICAMENTE el platillo que mejor coincida (>80% seguridad).
5. Si tienes CUALQUIER duda, es mejor responder "NINGUNO".

CATÁLOGO DE PLATILLOS DISPONIBLES:
${platillosString}

FORMATO DE RESPUESTA REQUERIDO:
Responde EXACTAMENTE en uno de estos dos formatos:

Si hay coincidencia segura:
"[NÚMERO]. [NOMBRE_PLATILLO]"
Ejemplo: "15. Ensalada César"

Si NO hay coincidencia o cualquier duda:
"NINGUNO - [razón breve]"
Ejemplo: "NINGUNO - La imagen no muestra comida claramente"`;

      // 5. Preparar contenido del mensaje
      const content: any[] = [
        {
          type: 'text',
          text: prompt,
        },
      ];

      // Agregar imagen si existe
      if (isImage) {
        content.push({
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${dto.imageBase64}`,
            detail: 'high',
          },
        });
      }

      // 6. Llamar a OpenAI
      this.logger.log(`📡 Enviando solicitud a OpenAI...`);
      const startTime = Date.now();

      const response = await axios.post(
        this.openaiApiUrl,
        {
          model: isImage ? 'gpt-4o' : 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'Eres un asistente experto en identificar platillos de comida. Sigue las instrucciones al pie de la letra y sé muy estricto con las validaciones.',
            },
            {
              role: 'user',
              content: content,
            },
          ],
          max_tokens: 300,
          temperature: 0.3,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.openaiApiKey}`,
          },
          timeout: 30000, // 30 segundos
        }
      );

      const aiAnswer = response.data.choices[0].message.content.trim();
      const duration = Date.now() - startTime;

      this.logger.log(`✅ Respuesta recibida en ${duration}ms: ${aiAnswer}`);

      // 7. Parsear respuesta y encontrar platillo
      let recognizedPlatillo: Platillo | null = null;
      let confidence = 'unknown';

      // Limpiar la respuesta de comillas extras que a veces agrega OpenAI
      const cleanAnswer = aiAnswer.replace(/^["']|["']$/g, '').trim();

      if (!cleanAnswer.toUpperCase().startsWith('NINGUNO')) {
        // Intentar extraer el número del platillo
        const match = cleanAnswer.match(/^(\d+)\./);
        if (match) {
          const index = parseInt(match[1]) - 1;
          if (index >= 0 && index < platillos.length) {
            recognizedPlatillo = platillos[index];
            confidence = 'high';
          }
        }
      } else {
        confidence = 'none';
      }

      return {
        success: !!recognizedPlatillo,
        aiResponse: aiAnswer,
        recognizedPlatillo: recognizedPlatillo
          ? {
              id: recognizedPlatillo.id,
              nombre: recognizedPlatillo.nombre,
            }
          : null,
        confidence,
        metadata: {
          mealType: dto.mealType,
          inputType,
          totalPlatillosEvaluados: platillos.length,
          responseTime: `${duration}ms`,
          model: isImage ? 'gpt-4o' : 'gpt-4o-mini',
        },
      };
    } catch (error) {
      this.logger.error(`❌ Error en reconocimiento: ${error.message}`, error.stack);
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.error?.message || error.message;
        
        if (status === 401) {
          throw new BadRequestException('API Key de OpenAI inválida o expirada');
        } else if (status === 429) {
          throw new BadRequestException('Límite de solicitudes de OpenAI excedido. Intenta más tarde.');
        } else if (status === 500) {
          throw new BadRequestException('Error en el servidor de OpenAI. Intenta más tarde.');
        }
        
        throw new BadRequestException(`Error de OpenAI: ${message}`);
      }

      throw error;
    }
  }

  // Método para obtener estadísticas de uso
  getUsageStats() {
    return {
      requestsThisMinute: this.requestCount,
      maxRequestsPerMinute: this.maxRequestsPerMinute,
      resetTime: new Date(this.resetTime).toISOString(),
    };
  }
}
