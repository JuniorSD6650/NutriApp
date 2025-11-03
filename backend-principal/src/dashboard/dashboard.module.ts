import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from '../auth/entities/user.entity';
import { Nino } from '../ninos/entities/nino.entity';
import { RegistroComida } from '../registros/entities/registro-comida.entity';
import { RegistroDeteccionTemprana } from '../registros/entities/registro-deteccion-temprana.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Nino, RegistroComida, RegistroDeteccionTemprana]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
