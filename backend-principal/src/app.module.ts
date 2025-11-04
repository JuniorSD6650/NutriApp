import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { NinosModule } from './ninos/ninos.module';
import { RegistrosModule } from './registros/registros.module';
import { SeedersModule } from './seeders/seeders.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { IngredientModule } from './ingredient/ingredient.module';
import { DishModule } from './dish/dish.module';
import { DishCompositionModule } from './dish-composition/dish-composition.module';
import { MealLogModule } from './meal-log/meal-log.module';
import { AgeRangeModule } from './age-range/age-range.module';
import { PlateTypeModule } from './plate-type/plate-type.module';

// Importar todas las entidades (sin RegistroComida)
import { User } from './auth/entities/user.entity';
import { Nino } from './ninos/entities/nino.entity';
import { RegistroDeteccionTemprana } from './registros/entities/registro-deteccion-temprana.entity';
import { Ingredient } from './ingredient/entities/ingredient.entity';
import { Dish } from './dish/entities/dish.entity';
import { DishComposition } from './dish-composition/entities/dish-composition.entity';
import { AgeRange } from './age-range/entities/age-range.entity';
import { DailyRequirement } from './daily-requirement/entities/daily-requirement.entity';
import { PlateType } from './plate-type/entities/plate-type.entity';
import { MealLog } from './meal-log/entities/meal-log.entity';

@Module({
  imports: [
    // 1. Load environment variables
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. Configure TypeORM for MySQL
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'nutrimama',
      entities: [
        User,
        Nino,
        RegistroDeteccionTemprana,
        Ingredient,
        Dish,
        DishComposition,
        AgeRange,
        DailyRequirement,
        PlateType,
        MealLog,
      ],
      synchronize: true, // Only for development
    }),

    // 3. Feature modules
    AuthModule,
    NinosModule,
    RegistrosModule,
    SeedersModule,
    DashboardModule,
    IngredientModule,
    DishModule,
    DishCompositionModule,
    MealLogModule,
    AgeRangeModule,
    PlateTypeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
