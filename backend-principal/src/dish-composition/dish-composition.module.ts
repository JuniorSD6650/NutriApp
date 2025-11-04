import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DishCompositionService } from './dish-composition.service';
import { DishCompositionController } from './dish-composition.controller';
import { DishComposition } from './entities/dish-composition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DishComposition])],
  controllers: [DishCompositionController],
  providers: [DishCompositionService],
  exports: [DishCompositionService],
})
export class DishCompositionModule {}
