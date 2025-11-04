import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DishController } from './dish.controller';
import { DishService } from './dish.service';
import { Dish } from './entities/dish.entity';
import { MealLog } from '../meal-log/entities/meal-log.entity';
import { DishComposition } from '../dish-composition/entities/dish-composition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dish, MealLog, DishComposition])],
  controllers: [DishController],
  providers: [DishService],
  exports: [DishService],
})
export class DishModule {}
