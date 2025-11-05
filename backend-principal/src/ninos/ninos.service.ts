import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nino } from './entities/nino.entity';
import { CreateNinoDto } from './dto/create-nino.dto';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class NinosService {
  constructor(
    @InjectRepository(Nino)
    private readonly ninoRepository: Repository<Nino>,
  ) {}

  async create(createNinoDto: CreateNinoDto, madre: User) {
    const nino = this.ninoRepository.create({
      ...createNinoDto,
      fecha_nacimiento: new Date(createNinoDto.fecha_nacimiento),
      madre,
    });

    return this.ninoRepository.save(nino);
  }

  async findByMadre(madreId: string) {
    return this.ninoRepository.find({
      where: { madre: { id: madreId } },
      relations: ['madre'],
    });
  }

  async findOne(id: string, madreId: string) {
    const nino = await this.ninoRepository.findOne({
      where: { id, madre: { id: madreId } },
      relations: ['madre'],
    });

    if (!nino) {
      throw new NotFoundException('Niño no encontrado');
    }

    return nino;
  }

  // Método para uso administrativo - no requiere madreId
  async findOneById(id: string): Promise<Nino> {
    const nino = await this.ninoRepository.findOne({
      where: { id },
      relations: ['madre'],
    });

    if (!nino) {
      throw new NotFoundException(`Niño con ID ${id} no encontrado`);
    }

    return nino;
  }

  async update(id: string, updateData: Partial<CreateNinoDto>, madreId: string) {
    const nino = await this.findOne(id, madreId);
    
    if (updateData.fecha_nacimiento) {
      updateData.fecha_nacimiento = new Date(updateData.fecha_nacimiento) as any;
    }

    Object.assign(nino, updateData);
    return this.ninoRepository.save(nino);
  }

  async getDependencies(id: string) {
    const nino = await this.ninoRepository.findOne({
      where: { id },
      relations: ['registros_deteccion_temprana', 'meal_logs']
    });

    if (!nino) {
      throw new NotFoundException('Niño no encontrado');
    }

    const deteccionesCount = nino.registros_deteccion_temprana?.length || 0;
    const mealLogsCount = nino.meal_logs?.length || 0;
    const dependencias: string[] = [];

    if (deteccionesCount > 0) dependencias.push(`${deteccionesCount} registro(s) de detección temprana`);
    if (mealLogsCount > 0) dependencias.push(`${mealLogsCount} registro(s) nutricionales`);

    const canDelete = dependencias.length === 0;

    return {
      canDelete,
      dependencias,
      message: canDelete 
        ? 'El niño puede ser eliminado' 
        : `El niño tiene: ${dependencias.join(', ')}`
    };
  }

  async remove(id: string, userId?: string, userRole?: string) {
    const nino = await this.ninoRepository.findOne({ 
      where: { id },
      relations: ['madre', 'registros_deteccion_temprana', 'meal_logs']
    });
    
    if (!nino) {
      throw new NotFoundException('Niño no encontrado');
    }

    // Verificar permisos (solo madres propietarias o admins pueden eliminar)
    if (userRole && userRole !== 'admin' && userId && nino.madre.id !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar este niño');
    }

    // Verificar dependencias
    const deteccionesCount = nino.registros_deteccion_temprana?.length || 0;
    const mealLogsCount = nino.meal_logs?.length || 0;
    const totalDependencies = deteccionesCount + mealLogsCount;

    if (totalDependencies > 0) {
      throw new ForbiddenException({
        message: `No se puede eliminar el niño "${nino.nombre}" porque tiene registros asociados`,
        details: 'Para eliminarlo, primero debe eliminar todos los registros relacionados.',
        dependencias: {
          detecciones: deteccionesCount,
          registrosNutricionales: mealLogsCount,
          total: totalDependencies
        },
        suggestion: 'Elimine primero los registros de detección y nutricionales, o contacte al administrador del sistema.'
      });
    }

    await this.ninoRepository.remove(nino);
    
    return {
      message: `Niño "${nino.nombre}" eliminado exitosamente`,
      deletedChild: {
        id: nino.id,
        nombre: nino.nombre,
      }
    };
  }
}
