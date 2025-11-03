import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { RegistrosController } from './registros.controller';
import { RegistrosService } from './registros.service';
import { RegistroComida } from './entities/registro-comida.entity';
import { RegistroDeteccionTemprana } from './entities/registro-deteccion-temprana.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RegistroComida, RegistroDeteccionTemprana]),
    HttpModule,
  ],
  controllers: [RegistrosController],
  providers: [RegistrosService],
  exports: [RegistrosService],
})
export class RegistrosModule {}
