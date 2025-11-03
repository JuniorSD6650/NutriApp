import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DishCompositionController } from './dish-composition.controller';
import { DishCompositionService } from './dish-composition.service';
import { DishComposition } from './entities/dish-composition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DishComposition])],
  controllers: [DishCompositionController],
  providers: [DishCompositionService],
  exports: [DishCompositionService],
})
export class DishCompositionModule {}
