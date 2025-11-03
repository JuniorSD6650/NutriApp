import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedersService } from './seeders.service';
import { User } from '../auth/entities/user.entity';
import { Nino } from '../ninos/entities/nino.entity';
import { RegistroComida } from '../registros/entities/registro-comida.entity';
import { RegistroTamizaje } from '../registros/entities/registro-tamizaje.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Nino,
      RegistroComida,
      RegistroTamizaje,
    ]),
  ],
  providers: [SeedersService],
  exports: [SeedersService],
})
export class SeedersModule {}
