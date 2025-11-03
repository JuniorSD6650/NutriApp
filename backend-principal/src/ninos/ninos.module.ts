import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NinosController } from './ninos.controller';
import { NinosService } from './ninos.service';
import { Nino } from './entities/nino.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Nino])],
  controllers: [NinosController],
  providers: [NinosService],
  exports: [NinosService],
})
export class NinosModule {}
