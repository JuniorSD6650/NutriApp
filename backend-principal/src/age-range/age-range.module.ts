import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgeRangeService } from './age-range.service';
import { AgeRange } from './entities/age-range.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AgeRange])],
  providers: [AgeRangeService],
  exports: [AgeRangeService],
})
export class AgeRangeModule {}
