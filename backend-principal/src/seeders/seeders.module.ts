import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedersService } from './seeders.service';
import { User } from '../auth/entities/user.entity';
import { Nino } from '../ninos/entities/nino.entity';
import { RegistroDeteccionTemprana } from '../registros/entities/registro-deteccion-temprana.entity';
import { Ingredient } from '../ingredient/entities/ingredient.entity';
import { Dish } from '../dish/entities/dish.entity';
import { DishComposition } from '../dish-composition/entities/dish-composition.entity';
import { AgeRange } from '../age-range/entities/age-range.entity';
import { DailyRequirement } from '../daily-requirement/entities/daily-requirement.entity';
import { PlateType } from '../plate-type/entities/plate-type.entity';
import { MealLog } from '../meal-log/entities/meal-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Nino,
      RegistroDeteccionTemprana,
      Ingredient,
      Dish,
      DishComposition,
      AgeRange,
      DailyRequirement,
      PlateType,
      MealLog,
    ]),
  ],
  providers: [SeedersService],
  exports: [SeedersService],
})
export class SeedersModule {}
