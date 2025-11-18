import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ProfilesService } from '../profiles/profiles.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull } from 'typeorm';
import { RegistroConsumo } from './entities/registro-consumo.entity';
import { CreateRegistroConsumoDto } from './dto/create-registro-consumo.dto';
import { QueryRegistroConsumoDto } from './dto/query-registro-consumo.dto';
import { User } from '../users/entities/user.entity';
import { Platillo } from '../platillos/entities/platillo.entity';

@Injectable()
export class RegistrosService {
  constructor(
    @InjectRepository(RegistroConsumo)
    private readonly registroConsumoRepository: Repository<RegistroConsumo>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Platillo)
    private readonly platilloRepository: Repository<Platillo>,
    private readonly profilesService: ProfilesService,
  ) {}

  // PATCH /registros/consumo/:id
  async update(userId: string, id: string, dto: any) {
    const registro = await this.registroConsumoRepository.findOne({ where: { id }, relations: ['usuario'] });
    if (!registro) throw new NotFoundException('Registro no encontrado');
    if (registro.usuario.id !== userId) throw new ForbiddenException('No tienes acceso a este registro');
    Object.assign(registro, dto);
    return this.registroConsumoRepository.save(registro);
  }

  // DELETE /registros/consumo/:id (soft delete)
  async softDelete(userId: string, id: string) {
    const registro = await this.registroConsumoRepository.findOne({ where: { id }, relations: ['usuario'] });
    if (!registro) throw new NotFoundException('Registro no encontrado');
    if (registro.usuario.id !== userId) throw new ForbiddenException('No tienes acceso a este registro');
    registro.deletedAt = new Date();
    return this.registroConsumoRepository.save(registro);
  }

  // PATCH /registros/consumo/:id/restore
  async restore(userId: string, id: string) {
    const registro = await this.registroConsumoRepository.findOne({ where: { id }, relations: ['usuario'], withDeleted: true });
    if (!registro) throw new NotFoundException('Registro no encontrado');
    if (registro.usuario.id !== userId) throw new ForbiddenException('No tienes acceso a este registro');
  registro.deletedAt = null;
    return this.registroConsumoRepository.save(registro);
  }

  // POST /registros/consumo/:id/force-delete
  async forceDelete(userId: string, id: string, confirmName: string) {
    const registro = await this.registroConsumoRepository.findOne({ where: { id }, relations: ['usuario'], withDeleted: true });
    if (!registro) throw new NotFoundException('Registro no encontrado');
    if (registro.usuario.id !== userId) throw new ForbiddenException('No tienes acceso a este registro');
    if (registro.usuario.name !== confirmName) throw new ForbiddenException('El nombre de confirmación no coincide');
    await this.registroConsumoRepository.remove(registro);
    return { message: 'Registro eliminado permanentemente.' };
  }

  // GET /registros/resumen-dia (para paciente autenticada)
  async resumenDia(userId: string, fecha?: string) {
    const fechaStr = fecha || new Date().toISOString().split('T')[0];
    const startOfDay = new Date(`${fechaStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${fechaStr}T23:59:59.999Z`);

    console.log('🔍 Consultando registros para userId:', userId);
    console.log('📅 Fecha:', fechaStr);

    const registros = await this.registroConsumoRepository.find({
      where: { 
        usuario: { id: userId }, 
        fecha: Between(startOfDay, endOfDay),
        deletedAt: IsNull() 
      },
      relations: [
        'platillo',
        'platillo.ingredientes',
        'platillo.ingredientes.ingrediente',
        'platillo.ingredientes.ingrediente.nutrientes',
        'platillo.ingredientes.ingrediente.nutrientes.nutriente'
      ],
      order: { fecha: 'ASC' },
    });

    console.log('📊 Registros encontrados:', registros.length);
    
    // AÑADIR DEBUGGING DETALLADO
    for (const registro of registros) {
      console.log('🍽️ Platillo:', registro.platillo?.nombre);
      console.log('  - Ingredientes:', registro.platillo?.ingredientes?.length || 0);
      
      if (registro.platillo?.ingredientes) {
        for (const pi of registro.platillo.ingredientes) {
          console.log(`    • ${pi.ingrediente?.name}: ${pi.cantidad}g`);
          console.log(`      Nutrientes: ${pi.ingrediente?.nutrientes?.length || 0}`);
          
          if (pi.ingrediente?.nutrientes) {
            for (const inNut of pi.ingrediente.nutrientes) {
              console.log(`        - ${inNut.nutriente?.name}: ${inNut.value_per_100g}/100g`);
            }
          }
        }
      }
    }

    let totalHierro = 0;

    type RegistroDetalle = {
      id: string;
      nombre: string;
      porciones: number;
      hierro: number;
      foto: string | undefined;
      descripcion: string | undefined;
      hora: string;
    };

    const registrosPorTipo: Record<string, RegistroDetalle[]> = {
      desayuno: [],
      almuerzo: [],
      cena: [],
      snack: [],
    };

    for (const registro of registros) {
      let hierroRegistro = 0;

      if (registro.platillo && registro.platillo.ingredientes) {
        for (const platilloIngrediente of registro.platillo.ingredientes) {
          const cantidadEnGramos = platilloIngrediente.cantidad * registro.porciones;

          // AÑADIR LOG AQUÍ
          console.log(`Procesando: ${platilloIngrediente.ingrediente?.name} - ${cantidadEnGramos}g`);

          if (platilloIngrediente.ingrediente?.nutrientes) {
            for (const ingredienteNutriente of platilloIngrediente.ingrediente.nutrientes) {
              const nutriente = ingredienteNutriente.nutriente;
              const valorPor100g = ingredienteNutriente.value_per_100g;
              const valorTotal = (valorPor100g * cantidadEnGramos) / 100;

              console.log(`  → Nutriente: ${nutriente?.name}, Valor: ${valorPor100g}/100g, Total: ${valorTotal}`);

              if (nutriente && nutriente.name.toLowerCase().includes('hierro')) {
                hierroRegistro += valorTotal;
                totalHierro += valorTotal;
                console.log(`    ✅ HIERRO DETECTADO: +${valorTotal}mg`);
              }
            }
          } else {
            console.log(`  ⚠️ Sin nutrientes para ${platilloIngrediente.ingrediente?.name}`);
          }
        }
      }

      registrosPorTipo[registro.tipo_comida].push({
        id: registro.id,
        nombre: registro.platillo?.nombre || registro.descripcion || 'Sin nombre',
        porciones: registro.porciones,
        hierro: Math.round(hierroRegistro * 100) / 100,
        foto: registro.foto,
        descripcion: registro.descripcion,
        hora: registro.fecha.toISOString(),
      });
    }

    console.log('🎯 TOTAL HIERRO CALCULADO:', totalHierro);

    return {
      fecha: fechaStr,
      totalRegistros: registros.length,
      totalHierro: Math.round(totalHierro * 100) / 100,
      registrosPorTipo,
    };
  }
  /**
   * Permite a un médico ver el resumen diario de un paciente si es su dueño
   */
  async getResumenDiarioPorMedico(medicoId: string, pacienteId: string, fecha: string) {
  // Verificar propiedad
  const esDueno = await this.profilesService.esDuenoDePaciente(medicoId, pacienteId);
  if (!esDueno) throw new ForbiddenException('No autorizado para ver el diario de este paciente');
    // Buscar registros del paciente en la fecha
    // Convertir fecha string a Date para la consulta
    const fechaDate = new Date(fecha);
    return this.registroConsumoRepository.find({
      where: { usuario: { id: pacienteId }, fecha: fechaDate },
      order: { fecha: 'DESC' },
    });
  }

  async create(userId: string, dto: CreateRegistroConsumoDto, fotoPath?: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const platillo = await this.platilloRepository.findOne({ 
      where: { id: dto.platilloId },
      relations: ['ingredientes', 'ingredientes.ingrediente', 'ingredientes.ingrediente.nutrientes', 'ingredientes.ingrediente.nutrientes.nutriente']
    });
    if (!platillo) throw new NotFoundException('Platillo no encontrado');

    const registro = this.registroConsumoRepository.create({
      usuario: user,
      platillo: platillo,
      tipo_comida: dto.tipo_comida,
      porciones: dto.porciones || 1,
      descripcion: dto.descripcion,
      foto: fotoPath,
    });
    
    return this.registroConsumoRepository.save(registro);
  }

  async findAll(userId: string, query: QueryRegistroConsumoDto) {
    const { page = 1, limit = 5, tipo_comida } = query;
    const skip = (page - 1) * limit;
    const where: any = { usuario: { id: userId }, deletedAt: IsNull() };
    if (tipo_comida) where.tipo_comida = tipo_comida;
    
    const [data, total] = await this.registroConsumoRepository.findAndCount({
      where,
      take: limit,
      skip,
      order: { fecha: 'DESC' },
      relations: ['platillo'],
    });
    
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(userId: string, id: string) {
    const registro = await this.registroConsumoRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['usuario', 'platillo', 'platillo.ingredientes', 'platillo.ingredientes.ingrediente'],
    });
    if (!registro) throw new NotFoundException('Registro no encontrado');
    if (registro.usuario.id !== userId) throw new ForbiddenException('No tienes acceso a este registro');
    return registro;
  }
}
