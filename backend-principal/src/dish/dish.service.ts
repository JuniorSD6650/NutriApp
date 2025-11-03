import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dish } from './entities/dish.entity';
import { CreateDishDto, UpdateDishDto } from './dto/dish.dto';

@Injectable()
export class DishService {
  constructor(
    @InjectRepository(Dish)
    private readonly dishRepository: Repository<Dish>,
  ) {}

  async create(createDishDto: CreateDishDto): Promise<Dish> {
    const dish = this.dishRepository.create(createDishDto);
    return this.dishRepository.save(dish);
  }

  async findAll(): Promise<Dish[]> {
    return this.dishRepository.find({
      relations: ['compositions', 'compositions.ingredient'],
    });
  }

  async findOne(id: string): Promise<Dish> {
    const dish = await this.dishRepository.findOne({ 
      where: { id },
      relations: ['compositions', 'compositions.ingredient'],
    });
    if (!dish) {
      throw new NotFoundException(`Dish with ID ${id} not found`);
    }
    return dish;
  }

  async findByName(name: string): Promise<Dish> {
    const dish = await this.dishRepository.findOne({ 
      where: { name },
      relations: ['compositions', 'compositions.ingredient'],
    });
    if (!dish) {
      throw new NotFoundException(`Dish with name "${name}" not found`);
    }
    return dish;
  }

  async update(id: string, updateDishDto: UpdateDishDto): Promise<Dish> {
    const dish = await this.findOne(id);
    Object.assign(dish, updateDishDto);
    return this.dishRepository.save(dish);
  }

  async remove(id: string): Promise<void> {
    const dish = await this.findOne(id);
    await this.dishRepository.remove(dish);
  }
}
