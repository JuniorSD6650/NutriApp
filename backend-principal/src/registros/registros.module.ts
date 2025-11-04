import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { RegistrosController } from './registros.controller';
import { RegistrosService } from './registros.service';
import { RegistroDeteccionTemprana } from './entities/registro-deteccion-temprana.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RegistroDeteccionTemprana]),
    HttpModule,
  ],
  controllers: [RegistrosController],
  providers: [RegistrosService],
  exports: [RegistrosService],
})
export class RegistrosModule {}
