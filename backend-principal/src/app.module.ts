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
      autoLoadEntities: true,
      synchronize: true, // Only for development
    }),

    // 3. Feature modules
    AuthModule,
    NinosModule,
    RegistrosModule,
    SeedersModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
