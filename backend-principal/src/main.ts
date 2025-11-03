import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Get CORS configuration from environment variables
  const corsOrigins = configService.get<string>('CORS_ORIGINS')?.split(',') || ['http://localhost:3000'];
  const corsMethods = configService.get<string>('CORS_METHODS')?.split(',') || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
  const corsHeaders = configService.get<string>('CORS_HEADERS')?.split(',') || ['Content-Type', 'Authorization'];
  const corsCredentials = configService.get<string>('CORS_CREDENTIALS') === 'true';

  // Enable CORS for frontend communication
  app.enableCors({
    origin: corsOrigins,
    methods: corsMethods,
    allowedHeaders: corsHeaders,
    credentials: corsCredentials,
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('NutriMama API')
    .setDescription('API para la aplicación NutriMama - Sistema de monitoreo nutricional infantil')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticación y registro de usuarios')
    .addTag('ninos', 'Gestión de niños')
    .addTag('registros', 'Registros nutricionales y de detección temprana')
    .addTag('dashboard', 'Dashboard administrativo')
    .addTag('ingredients', 'Gestión de ingredientes')
    .addTag('dishes', 'Gestión de platillos')
    .addTag('dish-compositions', 'Composiciones de platillos (recetas)')
    .addTag('age-ranges', 'Rangos de edad para cálculos nutricionales')
    .addTag('plate-types', 'Tipos de plato por edad')
    .addTag('meal-logs', 'Registros de comidas con cálculo nutricional automático')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Aplicación corriendo en: http://localhost:${port}`);
  console.log(`📚 Documentación Swagger en: http://localhost:${port}/api`);
  console.log(`🌐 CORS habilitado para: ${corsOrigins.join(', ')}`);
}
bootstrap();
