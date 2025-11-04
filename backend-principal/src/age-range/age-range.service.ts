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

  async findAll(): Promise<AgeRange[]> {
    return this.ageRangeRepository.find({
      order: { min_months: 'ASC' },
    });
  }
}
