// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { IngredientesModule } from './ingredientes/ingredientes.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { RegistrosModule } from './registros/registros.module';
import { MetaDiaria } from './metas/entities/meta-diaria.entity';
import { Platillo } from './platillos/entities/platillo.entity';
import { PlatilloIngrediente } from './platillos/entities/platillo-ingrediente.entity';
import { RegistroConsumo } from './registros/entities/registro-consumo.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
  entities: [MetaDiaria, Platillo, PlatilloIngrediente, RegistroConsumo, RefreshToken],
        synchronize: true,
      }),
    }),

    UsersModule,

    AuthModule,

    IngredientesModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    RegistrosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }