import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DishComposition } from './entities/dish-composition.entity';
import { CreateDishCompositionDto, UpdateDishCompositionDto } from './dto/dish-composition.dto';

@Injectable()
export class DishCompositionService {
  constructor(
    @InjectRepository(DishComposition)
    private readonly dishCompositionRepository: Repository<DishComposition>,
  ) {}

  async create(createDishCompositionDto: CreateDishCompositionDto): Promise<DishComposition> {
    const composition = this.dishCompositionRepository.create(createDishCompositionDto);
    return this.dishCompositionRepository.save(composition);
  }

  async findAll(): Promise<DishComposition[]> {
    return this.dishCompositionRepository.find({
      relations: ['dish', 'ingredient'],
    });
  }

  async findByDish(dishId: string): Promise<DishComposition[]> {
    return this.dishCompositionRepository.find({
      where: { dish: { id: dishId } },
      relations: ['dish', 'ingredient'],
    });
  }

  async findOne(id: string): Promise<DishComposition> {
    const composition = await this.dishCompositionRepository.findOne({ 
      where: { id },
      relations: ['dish', 'ingredient'],
    });
    if (!composition) {
      throw new NotFoundException(`DishComposition with ID ${id} not found`);
    }
    return composition;
  }

  async update(id: string, updateDishCompositionDto: UpdateDishCompositionDto): Promise<DishComposition> {
    const composition = await this.findOne(id);
    Object.assign(composition, updateDishCompositionDto);
    return this.dishCompositionRepository.save(composition);
  }

  async remove(id: string): Promise<void> {
    const composition = await this.findOne(id);
    await this.dishCompositionRepository.remove(composition);
  }
}
