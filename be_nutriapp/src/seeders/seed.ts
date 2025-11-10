// src/seeders/seed.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { NutrientesService } from '../ingredientes/nutrientes/nutrientes.service';
import { usersSeed } from './users.seed';
import { nutrientesSeed } from './nutrientes.seed';
import { pacientesProfilesSeed } from './pacientes-profiles.seed';
import { medicosProfilesSeed } from './medicos-profiles.seed';
import { PacienteProfilesService } from '../users/paciente-profiles.service';
import { MedicoProfilesService } from '../users/medico-profiles.service';
import { FiltroEstado } from '../common/enums/filtro-estado.enum';
import { IngredientesService } from '../ingredientes/ingredientes.service';
import { ingredientesSeed } from './ingredientes.seed';
import { ingredienteNutrientesSeed } from './ingrediente-nutrientes.seed';
import { DataSource } from 'typeorm';
import { platillosSeed } from './platillos.seed';
import { registrosSeed } from './registros.seed';
import { metasSeed } from './metas.seed';
import { platilloIngredientesSeed } from './platillo-ingredientes.seed';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  console.log('🌱 Comenzando el sembrado (seeding)...');

  try {
    const usersService = app.get(UsersService);
    for (const userData of usersSeed) {
      const exists = await usersService.findOneByEmail(userData.email);
      if (exists) {
        console.log(`El usuario ${userData.email} ya existe. Omitiendo.`);
      } else {
        await usersService.createUser(userData);
        console.log(`✓ Usuario ${userData.email} creado.`);
      }
    }

    const pacienteProfilesService = app.get(PacienteProfilesService);
    for (const profileData of pacientesProfilesSeed) {
      const user = await usersService.findOneByEmail(profileData.userEmail);
      if (!user) {
        console.log(`Usuario para perfil paciente (${profileData.userEmail}) no encontrado. Omitiendo perfil.`);
        continue;
      }
      const dto = {
        fecha_nacimiento: profileData.birthDate || '1990-01-01',
        peso_inicial_kg: profileData.weight || 60,
        altura_cm: profileData.height || 165,
        alergias_alimentarias: profileData.allergies || '',
        toma_suplementos_hierro: false,
        user: user,
      };
      if (user.pacienteProfile) {
        console.log(`Perfil de paciente para ${profileData.userEmail} ya existe. Omitiendo.`);
        continue;
      }
      await pacienteProfilesService.create(dto);
      console.log(`✓ Perfil de paciente para ${profileData.userEmail} creado.`);
    }

    const medicoProfilesService = app.get(MedicoProfilesService);
    for (const profileData of medicosProfilesSeed) {
      const user = await usersService.findOneByEmail(profileData.userEmail);
      if (!user) {
        console.log(`Usuario para perfil médico (${profileData.userEmail}) no encontrado. Omitiendo perfil.`);
        continue;
      }
      const dto = {
        especialidad: profileData.specialty || 'Nutriología',
        numero_colegiado: profileData.licenseNumber || 'MED123456',
        biografia: '',
        user: user,
      };
      if (user.medicoProfile) {
        console.log(`Perfil de médico para ${profileData.userEmail} ya existe. Omitiendo.`);
        continue;
      }
      await medicoProfilesService.create(dto);
      console.log(`✓ Perfil de médico para ${profileData.userEmail} creado.`);
    }

    const nutrientesService = app.get(NutrientesService);
    for (const nutrienteData of nutrientesSeed) {
      try {
        await nutrientesService.create(nutrienteData);
        console.log(`✓ Nutriente '${nutrienteData.name}' creado.`);
      } catch (e) {
        if (e.code === 'ER_DUP_ENTRY' || e.code === '23505' || (e.message && e.message.includes('ya existe'))) {
          console.log(`El nutriente '${nutrienteData.name}' ya existe. Omitiendo.`);
        } else {
          throw e;
        }
      }
    }
    console.log('Nutrientes maestros listos.');

    // --- 5. Sembrado de Ingredientes ---
    const ingredientesService = app.get(IngredientesService);
    // Obtener todos los nutrientes para mapear nombre->id
    const allNutrientes = await nutrientesService.findAll({ page: 1, limit: 100, estado: FiltroEstado.ACTIVO });
    const nutrientesMap = {};
    for (const n of allNutrientes.data) {
      nutrientesMap[n.name] = n.id;
    }

    for (const ingredienteData of ingredientesSeed) {
      // Buscar si ya existe
      try {
        await ingredientesService.create({
          name: ingredienteData.name,
          nutrientes: ingredienteNutrientesSeed
            .filter(rel => rel.ingrediente === ingredienteData.name)
            .map(rel => ({
              nutrienteId: nutrientesMap[rel.nutriente],
              value: rel.value
            }))
        });
        console.log(`✓ Ingrediente '${ingredienteData.name}' creado.`);
      } catch (e) {
        if (e.code === 'ER_DUP_ENTRY' || e.code === '23505' || (e.message && e.message.includes('ya existe'))) {
          console.log(`El ingrediente '${ingredienteData.name}' ya existe. Omitiendo.`);
        } else {
          throw e;
        }
      }
    }
    console.log('Ingredientes y relaciones sembrados.');

    // --- 6. Sembrado de Platillos ---
    const dataSource = app.get(DataSource);
  await platillosSeed(dataSource);
  await platilloIngredientesSeed(dataSource);
  await registrosSeed(dataSource);
  await metasSeed(dataSource);
  console.log('Platillos, ingredientes de platillo, registros y metas sembrados.');
  } catch (error) {
    console.error('Error durante el sembrado:', error);
  } finally {
    await app.close();
    console.log('🌱 Sembrado (seeding) finalizado.');
  }
}

bootstrap();