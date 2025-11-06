// src/seeders/seed.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { Role } from '../users/enums/role.enum';
import { Nutriente } from '../ingredientes/entities/nutriente.entity'; // <-- IMPORTAR
import { getRepository } from 'typeorm'; // <-- IMPORTAR (si da error, usamos app.get(Repository...))

/**
 * Script para sembrar la base de datos
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  console.log('🌱 Comenzando el sembrado (seeding)...');
  
  try {
    // --- 1. Sembrado de Usuarios (Admin) ---
    const usersService = app.get(UsersService);
    const adminEmail = 'admin@nutriapp.com';
    let admin = await usersService.findOneByEmail(adminEmail);
    
    if (admin) {
      console.log('El usuario Admin ya existe. Omitiendo.');
    } else {
      console.log('Creando usuario Admin...');
      admin = await usersService.create(
        adminEmail,
        'admin123',
        'Administrador',
        Role.ADMIN,
      );
      console.log('✓ Usuario Admin creado con éxito.');
    }

    const nutrienteRepository = app.get('NutrienteRepository'); 
    
    console.log('Sembrando nutrientes maestros...');
    
    const nutrientesMaestros = [
      { name: 'Hierro', unit: 'mg' },
      { name: 'Calorías', unit: 'kcal' },
      { name: 'Proteínas', unit: 'g' },
      { name: 'Carbohidratos', unit: 'g' },
    ];

    for (const data of nutrientesMaestros) {
      const nutriente = await nutrienteRepository.findOneBy({ name: data.name });
      if (!nutriente) {
        await nutrienteRepository.save(nutrienteRepository.create(data));
        console.log(`✓ Nutriente '${data.name}' creado.`);
      }
    }
    console.log('Nutrientes maestros listos.');

  } catch (error) {
    console.error('Error durante el sembrado:', error);
  } finally {
    await app.close();
    console.log('🌱 Sembrado (seeding) finalizado.');
  }
}

bootstrap();