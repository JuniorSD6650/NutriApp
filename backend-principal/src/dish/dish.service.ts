import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dish } from './entities/dish.entity';
import { CreateDishDto, UpdateDishDto } from './dto/dish.dto';
import { MealLog } from '../meal-log/entities/meal-log.entity';
import { DishComposition } from '../dish-composition/entities/dish-composition.entity';

@Injectable()
export class DishService {
  constructor(
    @InjectRepository(Dish)
    private readonly dishRepository: Repository<Dish>,
    @InjectRepository(MealLog)
    private readonly mealLogRepository: Repository<MealLog>,
    @InjectRepository(DishComposition)
    private readonly dishCompositionRepository: Repository<DishComposition>,
  ) {}

  async create(createDishDto: CreateDishDto): Promise<Dish> {
    const dish = this.dishRepository.create(createDishDto);
    return this.dishRepository.save(dish);
  }

  async findAll(): Promise<Dish[]> {
    return this.dishRepository.find({
      relations: ['compositions', 'compositions.ingredient'],
      order: { created_at: 'DESC' },
    });
  }

  async findAllActive(): Promise<Dish[]> {
    return this.dishRepository.find({
      where: { is_active: true },
      relations: ['compositions', 'compositions.ingredient'],
      order: { created_at: 'DESC' },
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
    
    // Verificar si existen meal logs que referencian este platillo
    const existingMealLogs = await this.mealLogRepository.count({
      where: { dish: { id } }
    });

    if (existingMealLogs > 0) {
      throw new BadRequestException(
        `No se puede eliminar el platillo "${dish.name}" porque tiene ${existingMealLogs} registros de comida asociados. ` +
        `Elimine primero los registros de comida o considere desactivar el platillo en lugar de eliminarlo.`
      );
    }

    // Si no hay meal logs, eliminar primero las composiciones
    await this.dishCompositionRepository.delete({ dish: { id } });
    
    // Luego eliminar el platillo
    await this.dishRepository.remove(dish);
  }

  async deactivate(id: string): Promise<{ message: string; dish: Dish }> {
    const dish = await this.findOne(id);
    dish.is_active = false;
    const updatedDish = await this.dishRepository.save(dish);
    
    return {
      message: `Platillo "${dish.name}" desactivado exitosamente`,
      dish: updatedDish
    };
  }

  async activate(id: string): Promise<{ message: string; dish: Dish }> {
    const dish = await this.findOne(id);
    dish.is_active = true;
    const updatedDish = await this.dishRepository.save(dish);
    
    return {
      message: `Platillo "${dish.name}" activado exitosamente`,
      dish: updatedDish
    };
  }

  async toggleStatus(id: string): Promise<{ message: string; dish: Dish }> {
    const dish = await this.findOne(id);
    dish.is_active = !dish.is_active;
    const updatedDish = await this.dishRepository.save(dish);
    
    const action = dish.is_active ? 'activado' : 'desactivado';
    return {
      message: `Platillo "${dish.name}" ${action} exitosamente`,
      dish: updatedDish
    };
  }

  // Método adicional para verificar dependencias
  async checkDependencies(id: string): Promise<{
    canDelete: boolean;
    canDeactivate: boolean;
    mealLogsCount: number;
    compositionsCount: number;
    message?: string;
    currentStatus: boolean;
  }> {
    const dish = await this.findOne(id);
    
    const mealLogsCount = await this.mealLogRepository.count({
      where: { dish: { id } }
    });

    const compositionsCount = await this.dishCompositionRepository.count({
      where: { dish: { id } }
    });

    const canDelete = mealLogsCount === 0;
    const canDeactivate = true; // Siempre se puede desactivar
    
    let message = '';
    if (!canDelete) {
      message = `El platillo "${dish.name}" tiene ${mealLogsCount} registros de comida y ${compositionsCount} ingredientes asociados.`;
    }

    return {
      canDelete,
      canDeactivate,
      mealLogsCount,
      compositionsCount,
      message,
      currentStatus: dish.is_active
    };
  }
}
