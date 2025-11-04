import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlateType } from './entities/plate-type.entity';

@Injectable()
export class PlateTypeService {
  constructor(
    @InjectRepository(PlateType)
    private readonly plateTypeRepository: Repository<PlateType>,
  ) {}

  async findByAgeRange(ageRangeId: string): Promise<PlateType> {
    const plateType = await this.plateTypeRepository.findOne({
      where: { ageRange: { id: ageRangeId } },
      relations: ['ageRange'],
    });

    if (!plateType) {
      throw new NotFoundException(`No plate type found for age range ${ageRangeId}`);
    }

    return plateType;
  }

  async findAll(): Promise<PlateType[]> {
    return this.plateTypeRepository.find({
      relations: ['ageRange'],
      order: { ageRange: { min_months: 'ASC' } },
    });
  }
}
