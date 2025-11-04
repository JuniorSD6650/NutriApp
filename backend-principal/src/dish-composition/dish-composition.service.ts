import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DishComposition } from './entities/dish-composition.entity';
import { CreateDishCompositionDto } from './dto/create-dish-composition.dto';
import { UpdateDishCompositionDto } from './dto/update-dish-composition.dto';

@Injectable()
export class DishCompositionService {
  constructor(
    @InjectRepository(DishComposition)
    private readonly dishCompositionRepository: Repository<DishComposition>,
  ) {}

  async create(createDishCompositionDto: CreateDishCompositionDto) {
    const composition = this.dishCompositionRepository.create({
      dish: { id: createDishCompositionDto.dishId },
      ingredient: { id: createDishCompositionDto.ingredientId },
      grams: createDishCompositionDto.grams,
    });

    const savedComposition = await this.dishCompositionRepository.save(composition);

    // Retornar la composición completa con las relaciones
    return await this.dishCompositionRepository.findOne({
      where: { id: savedComposition.id },
      relations: ['dish', 'ingredient'],
    });
  }

  async findAll() {
    return await this.dishCompositionRepository.find({
      relations: ['dish', 'ingredient'],
    });
  }

  async findOne(id: string) {
    const composition = await this.dishCompositionRepository.findOne({
      where: { id },
      relations: ['dish', 'ingredient'],
    });

    if (!composition) {
      throw new NotFoundException(`Dish composition with ID ${id} not found`);
    }

    return composition;
  }

  async update(id: string, updateDishCompositionDto: UpdateDishCompositionDto) {
    const composition = await this.findOne(id);
    Object.assign(composition, updateDishCompositionDto);
    const savedComposition = await this.dishCompositionRepository.save(composition);

    // Retornar la composición actualizada con las relaciones
    return await this.dishCompositionRepository.findOne({
      where: { id: savedComposition.id },
      relations: ['dish', 'ingredient'],
    });
  }

  async remove(id: string) {
    const composition = await this.findOne(id);
    await this.dishCompositionRepository.remove(composition);
    return { message: 'Dish composition deleted successfully' };
  }

  async findByDish(dishId: string) {
    return await this.dishCompositionRepository.find({
      where: { dish: { id: dishId } },
      relations: ['ingredient'],
    });
  }
}
