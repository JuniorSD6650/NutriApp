import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlateTypeService } from './plate-type.service';
import { PlateType } from './entities/plate-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlateType])],
  providers: [PlateTypeService],
  exports: [PlateTypeService],
})
export class PlateTypeModule {}
