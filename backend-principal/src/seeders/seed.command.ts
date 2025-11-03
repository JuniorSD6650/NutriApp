import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedersService } from './seeders.service';

async function runSeeders() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedersService = app.get(SeedersService);
  
  try {
    await seedersService.seedAll();
    console.log('🎉 Seeding completado!');
  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
  } finally {
    await app.close();
  }
}

runSeeders();
