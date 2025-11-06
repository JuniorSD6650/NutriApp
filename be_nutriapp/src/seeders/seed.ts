// src/seeders/seed.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service'; 
import { Role } from '../users/enums/role.enum';     


async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  console.log('🌱 Comenzando el sembrado (seeding)...');

  const usersService = app.get(UsersService);

  const adminEmail = 'admin@nutriapp.com';
  const adminPassword = 'admin123'; 

  try {
    let admin = await usersService.findOneByEmail(adminEmail);
    
    if (admin) {
      console.log('El usuario Admin ya existe. Omitiendo.');
    } else {
      console.log('Creando usuario Admin...');
      admin = await usersService.create(
        adminEmail,
        adminPassword,
        'Administrador',
        Role.ADMIN, 
      );
      console.log('✓ Usuario Admin creado con éxito:');
      console.log(admin);
    }
  } catch (error) {
    console.error('Error durante el sembrado:', error);
  } finally {
    await app.close();
    console.log('🌱 Sembrado (seeding) finalizado.');
  }
}

bootstrap();