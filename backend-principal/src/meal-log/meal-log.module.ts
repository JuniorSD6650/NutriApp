import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealLogController } from './meal-log.controller';
import { MealLogService } from './meal-log.service';
import { MealLog } from './entities/meal-log.entity';
import { NinosModule } from '../ninos/ninos.module';
import { AgeRangeModule } from '../age-range/age-range.module';
import { PlateTypeModule } from '../plate-type/plate-type.module';
import { DishModule } from '../dish/dish.module';
import { DishCompositionModule } from '../dish-composition/dish-composition.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MealLog]),
    NinosModule,
    AgeRangeModule,
    PlateTypeModule,
    DishModule,
    DishCompositionModule,
  ],
  controllers: [MealLogController],
  providers: [MealLogService],
  exports: [MealLogService],
})
export class MealLogModule {}
