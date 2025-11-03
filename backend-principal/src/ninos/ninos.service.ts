import { Injectable, NotFoundException } from '@nestjs/common';
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

  async update(id: string, updateData: Partial<CreateNinoDto>, madreId: string) {
    const nino = await this.findOne(id, madreId);
    
    if (updateData.fecha_nacimiento) {
      updateData.fecha_nacimiento = new Date(updateData.fecha_nacimiento) as any;
    }

    Object.assign(nino, updateData);
    return this.ninoRepository.save(nino);
  }

  async remove(id: string, madreId: string) {
    const nino = await this.findOne(id, madreId);
    return this.ninoRepository.remove(nino);
  }
}
