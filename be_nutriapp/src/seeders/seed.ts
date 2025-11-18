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
    const medicoEmailToId = {};
    
    // 1. Insertar médicos y guardar email->id
    for (const userData of usersSeed.filter(u => u.role === 'medico')) {
      const exists = await usersService.findOneByEmail(userData.email);
      let medico;
      if (exists) {
        medico = exists;
        console.log(`El médico ${userData.email} ya existe. Omitiendo.`);
      } else {
        medico = await usersService.createUser(userData);
        console.log(`✓ Médico ${userData.email} creado.`);
      }
      medicoEmailToId[userData.email] = medico.id;
    }

    // 2. Insertar admin normalmente
    const adminData = usersSeed.find(u => u.role === 'admin');
    if (adminData) {
      const exists = await usersService.findOneByEmail(adminData.email);
      if (!exists) {
        await usersService.createUser(adminData);
        console.log(`✓ Admin ${adminData.email} creado.`);
      }
    }

    // 3. Insertar pacientes, luego actualizar con medicoId real
    for (const userData of usersSeed.filter(u => u.role === 'paciente')) {
      const exists = await usersService.findOneByEmail(userData.email);
      if (exists) {
        console.log(`El paciente ${userData.email} ya existe. Omitiendo.`);
        continue;
      }
      // Extraer medicoId si existe (solo para pacientes)
      const { medicoId, ...pacienteData } = userData as typeof userData & { medicoId?: number };
      const paciente = await usersService.createUser(pacienteData);
      // Asignar médico real si corresponde
      if (medicoId) {
        const medicoEmail = `medico${medicoId}@nutriapp.com`;
        const medicoDbId = medicoEmailToId[medicoEmail];
        if (medicoDbId) {
          await usersService.asignarPacientesAMedico(medicoDbId, [paciente.id]);
          console.log(`✓ Paciente ${userData.email} creado y asignado a médico ${medicoEmail}`);
        } else {
          console.log(`Paciente ${userData.email} creado pero médico ${medicoEmail} no encontrado.`);
        }
      } else {
        console.log(`✓ Paciente ${userData.email} creado sin médico asignado.`);
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

    // ORDEN CORRECTO (verificar que esté así):
    console.log('1. Sembrando nutrientes...');
    const nutrientesService = app.get(NutrientesService);
    for (const nutrienteData of nutrientesSeed) {
      try {
        await nutrientesService.create(nutrienteData);
        console.log(`✓ Nutriente '${nutrienteData.name}' creado.`);
      } catch (e) {
        if (e.code === 'ER_DUP_ENTRY' || e.code === '23505') {
          console.log(`El nutriente '${nutrienteData.name}' ya existe. Omitiendo.`);
        } else {
          throw e;
        }
      }
    }

    console.log('2. Sembrando ingredientes con sus nutrientes...');
    const ingredientesService = app.get(IngredientesService);
    const allNutrientes = await nutrientesService.findAll({ page: 1, limit: 100, estado: FiltroEstado.ACTIVO });
    const nutrientesMap = {};
    for (const n of allNutrientes.data) {
      nutrientesMap[n.name] = n.id;
    }

    for (const ingredienteData of ingredientesSeed) {
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
        if (e.code === 'ER_DUP_ENTRY' || e.code === '23505') {
          console.log(`El ingrediente '${ingredienteData.name}' ya existe. Omitiendo.`);
        } else {
          throw e;
        }
      }
    }

    console.log('3. Sembrando platillos...');
    const dataSource = app.get(DataSource);
    await platillosSeed(dataSource);

    console.log('4. Relacionando platillos con ingredientes...');
    await platilloIngredientesSeed(dataSource);

    console.log('5. Sembrando registros de consumo...');
    await registrosSeed(dataSource); // <-- PRIMERO LOS REGISTROS

    console.log('6. Sembrando metas (calculando hierro consumido)...');
    await metasSeed(dataSource); // <-- DESPUÉS LAS METAS
    console.log('Platillos, ingredientes de platillo, metas y registros sembrados.');
    
  } catch (error) {
    console.error('Error durante el sembrado:', error);
  } finally {
    await app.close();
    console.log('🌱 Sembrado (seeding) finalizado.');
  }
}

bootstrap();