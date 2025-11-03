import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgeRange } from './entities/age-range.entity';

@Injectable()
export class AgeRangeService {
  constructor(
    @InjectRepository(AgeRange)
    private readonly ageRangeRepository: Repository<AgeRange>,
  ) {}

  async findAll(): Promise<AgeRange[]> {
    return this.ageRangeRepository.find({
      relations: ['dailyRequirements', 'plateTypes'],
    });
  }

  async findOne(id: string): Promise<AgeRange> {
    const ageRange = await this.ageRangeRepository.findOne({ 
      where: { id },
      relations: ['dailyRequirements', 'plateTypes'],
    });
    if (!ageRange) {
      throw new NotFoundException(`AgeRange with ID ${id} not found`);
    }
    return ageRange;
  }

  async findByMonths(ageInMonths: number): Promise<AgeRange> {
    const ageRange = await this.ageRangeRepository
      .createQueryBuilder('ageRange')
      .where(':age BETWEEN ageRange.min_months AND ageRange.max_months', { age: ageInMonths })
      .getOne();
    
    if (!ageRange) {
      throw new NotFoundException(`No age range found for ${ageInMonths} months`);
    }
    return ageRange;
  }
}
