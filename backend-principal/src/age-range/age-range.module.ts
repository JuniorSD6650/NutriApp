import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgeRangeController } from './age-range.controller';
import { AgeRangeService } from './age-range.service';
import { AgeRange } from './entities/age-range.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AgeRange])],
  controllers: [AgeRangeController],
  providers: [AgeRangeService],
  exports: [AgeRangeService],
})
export class AgeRangeModule {}
