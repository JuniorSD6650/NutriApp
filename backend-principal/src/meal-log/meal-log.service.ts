import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealLog } from './entities/meal-log.entity';
import { CreateMealLogDto } from './dto/meal-log.dto';
import { NinosService } from '../ninos/ninos.service';
import { AgeRangeService } from '../age-range/age-range.service';
import { PlateTypeService } from '../plate-type/plate-type.service';
import { DishService } from '../dish/dish.service';
import { DishCompositionService } from '../dish-composition/dish-composition.service';

@Injectable()
export class MealLogService {
  constructor(
    @InjectRepository(MealLog)
    private readonly mealLogRepository: Repository<MealLog>,
    private readonly ninosService: NinosService,
    private readonly ageRangeService: AgeRangeService,
    private readonly plateTypeService: PlateTypeService,
    private readonly dishService: DishService,
    private readonly dishCompositionService: DishCompositionService,
  ) {}

  async create(dto: CreateMealLogDto): Promise<MealLog> {
    try {
      // 1. Obtener Paciente y Rango de Edad
      const patient = await this.ninosService.findOneById(dto.patientId);
      const ageInMonths = patient.getAgeInMonths();
      const ageRange = await this.ageRangeService.findByMonths(ageInMonths);
      
      // 2. Obtener el tamaño de porción (Plato) para esa edad
      const plate = await this.plateTypeService.findByAgeRange(ageRange.id);
      const plateSizeInGrams = plate.serving_size_g; // Ej. 180g

      // 3. Obtener el Platillo (Dish) y sus componentes (Receta)
      let dish;
      if (dto.dishId) {
        dish = await this.dishService.findOne(dto.dishId);
      } else if (dto.dishName) {
        dish = await this.dishService.findByName(dto.dishName);
      } else {
        throw new BadRequestException('Either dishId or dishName must be provided');
      }

      const components = await this.dishCompositionService.findByDish(dish.id);

      if (components.length === 0) {
        throw new BadRequestException(`No composition found for dish: ${dish.name}`);
      }

      // 4. Calcular el valor nutricional de la "Receta Base"
      let totalBaseGrams = 0;
      let totalBaseIron = 0;
      let totalBaseCalories = 0;

      for (const comp of components) {
        totalBaseGrams += comp.grams;
        
        // Calcula el hierro y calorías para este componente específico
        const ironInComponent = (comp.ingredient.iron_mg_per_100g / 100) * comp.grams;
        const caloriesInComponent = (comp.ingredient.calories_per_100g / 100) * comp.grams;
        
        totalBaseIron += ironInComponent;
        totalBaseCalories += caloriesInComponent;
      }
      // Ahora sabemos que la receta base (ej. 200g) tiene (ej.) 15mg de hierro y 350 calorías

      // 5. Calcular el Factor de Escalado
      // (Compara el plato del niño con el tamaño de la receta base)
      const scalingFactor = plateSizeInGrams / totalBaseGrams;

      // 6. Calcular el Hierro y Calorías Finales Consumidas
      // Si el plato del niño es 180g y la receta base 200g, el factor es 0.9
      // El niño comió 0.9 * 15mg = 13.5mg de hierro y 0.9 * 350 = 315 calorías
      const finalIronConsumed = totalBaseIron * scalingFactor;
      const finalCaloriesConsumed = totalBaseCalories * scalingFactor;

      // 7. Guardar el Log
      const newLog = this.mealLogRepository.create({
        patient: patient,
        dish: dish,
        date: new Date(),
        grams_served: plateSizeInGrams,
        iron_consumed_mg: Number(finalIronConsumed.toFixed(2)),
        calories_consumed: Number(finalCaloriesConsumed.toFixed(2)),
      });

      const savedLog = await this.mealLogRepository.save(newLog);

      console.log(`📊 Cálculo nutricional completado:
        - Paciente: ${patient.nombre} (${ageInMonths} meses)
        - Platillo: ${dish.name}
        - Receta base: ${totalBaseGrams}g con ${totalBaseIron.toFixed(2)}mg hierro
        - Porción servida: ${plateSizeInGrams}g (factor: ${scalingFactor.toFixed(2)})
        - Hierro consumido: ${finalIronConsumed.toFixed(2)}mg
        - Calorías consumidas: ${finalCaloriesConsumed.toFixed(2)}kcal`);

      return savedLog;

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error creating meal log: ${error.message}`);
    }
  }

  async findAll(): Promise<MealLog[]> {
    return this.mealLogRepository.find({
      relations: ['patient', 'dish', 'dish.compositions', 'dish.compositions.ingredient'],
      order: { date: 'DESC' },
    });
  }

  async findByPatient(patientId: string): Promise<MealLog[]> {
    return this.mealLogRepository.find({
      where: { patient: { id: patientId } },
      relations: ['patient', 'dish'],
      order: { date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<MealLog> {
    const mealLog = await this.mealLogRepository.findOne({
      where: { id },
      relations: ['patient', 'dish', 'dish.compositions', 'dish.compositions.ingredient'],
    });
    
    if (!mealLog) {
      throw new NotFoundException(`MealLog with ID ${id} not found`);
    }
    return mealLog;
  }

  async remove(id: string): Promise<void> {
    const mealLog = await this.findOne(id);
    await this.mealLogRepository.remove(mealLog);
  }

  // Método para obtener estadísticas nutricionales de un paciente
  async getNutritionalStats(patientId: string, days: number = 7): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const mealLogs = await this.mealLogRepository
      .createQueryBuilder('mealLog')
      .leftJoinAndSelect('mealLog.patient', 'patient')
      .leftJoinAndSelect('mealLog.dish', 'dish')
      .where('mealLog.patient.id = :patientId', { patientId })
      .andWhere('mealLog.date >= :startDate', { startDate })
      .orderBy('mealLog.date', 'DESC')
      .getMany();

    const totalIron = mealLogs.reduce((sum, log) => sum + Number(log.iron_consumed_mg), 0);
    const totalCalories = mealLogs.reduce((sum, log) => sum + Number(log.calories_consumed || 0), 0);
    const averageIronPerDay = totalIron / days;
    const averageCaloriesPerDay = totalCalories / days;

    return {
      period: `${days} días`,
      totalMeals: mealLogs.length,
      totalIron: Number(totalIron.toFixed(2)),
      totalCalories: Number(totalCalories.toFixed(2)),
      averageIronPerDay: Number(averageIronPerDay.toFixed(2)),
      averageCaloriesPerDay: Number(averageCaloriesPerDay.toFixed(2)),
      mealLogs,
    };
  }
}
