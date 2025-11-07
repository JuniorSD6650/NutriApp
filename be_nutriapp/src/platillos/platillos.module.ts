import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Platillo } from './entities/platillo.entity';
import { PlatilloIngrediente } from './entities/platillo-ingrediente.entity';
import { PlatillosService } from './platillos.service';
import { PlatillosController } from './platillos.controller';
import { Ingrediente } from '../ingredientes/entities/ingrediente.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Platillo,
      PlatilloIngrediente,
      Ingrediente,
    ]),
  ],
  controllers: [PlatillosController],
  providers: [PlatillosService],
})
export class PlatillosModule {}
