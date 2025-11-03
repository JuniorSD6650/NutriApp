import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:19006'], // React Native Metro
    credentials: true,
  });

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
    .addTag('registros', 'Registros nutricionales y de tamizaje')
    .addTag('dashboard', 'Dashboard administrativo')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Aplicación corriendo en: http://localhost:${port}`);
  console.log(`📚 Documentación Swagger en: http://localhost:${port}/api`);
}
bootstrap();
