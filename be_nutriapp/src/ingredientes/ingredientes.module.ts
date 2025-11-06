// src/ingredientes/ingredientes.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ingrediente } from './entities/ingrediente.entity';
import { Nutriente } from './entities/nutriente.entity';
import { IngredienteNutriente } from './entities/ingrediente-nutriente.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

// --- Importaciones del Módulo "Padre" ---
import { IngredientesService } from './ingredientes.service';
import { IngredientesController } from './ingredientes.controller';

// --- Importaciones del "Sub-módulo" ---
import { NutrientesController } from './nutrientes/nutrientes.controller';
import { NutrientesService } from './nutrientes/nutrientes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ingrediente,
      Nutriente,
      IngredienteNutriente
    ]),
    AuthModule,
    UsersModule,
  ],
  controllers: [
    IngredientesController, // Controlador "padre"
    NutrientesController,   // Controlador "hijo"
  ],
  providers: [
    IngredientesService, // Servicio "padre"
    NutrientesService,   // Servicio "hijo"
  ]
})
export class IngredientesModule {}