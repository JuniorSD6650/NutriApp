import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from '../auth/entities/user.entity';
import { Nino } from '../ninos/entities/nino.entity';
import { RegistroComida } from '../registros/entities/registro-comida.entity';
import { RegistroTamizaje } from '../registros/entities/registro-tamizaje.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Nino, RegistroComida, RegistroTamizaje]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
