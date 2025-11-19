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
import { User } from '../users/entities/user.entity';
import { PacienteProfile } from '../users/entities/paciente-profile.entity';
import { MedicoProfile } from '../users/entities/medico-profile.entity';
import { Ingrediente } from '../ingredientes/entities/ingrediente.entity';
import { Nutriente } from '../ingredientes/entities/nutriente.entity'; // <-- CAMBIO AQUÍ
import { IngredienteNutriente } from '../ingredientes/entities/ingrediente-nutriente.entity';
import { Platillo } from '../platillos/entities/platillo.entity';
import { PlatilloIngrediente } from '../platillos/entities/platillo-ingrediente.entity';
import { platillosSeed } from './platillos.seed';
import { platilloIngredientesSeed } from './platillo-ingredientes.seed';
import { registrosSeed } from './registros.seed';
import { metasSeed } from './metas.seed';
import * as bcrypt from 'bcrypt';
import { Role } from '../users/enums/role.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  console.log('🌱 Comenzando el sembrado (seeding)...');

  try {
    const usersService = app.get(UsersService);
    const dataSource = app.get(DataSource);
    const userRepo = dataSource.getRepository(User);
    const medicoProfileRepo = dataSource.getRepository(MedicoProfile);
    const pacienteProfileRepo = dataSource.getRepository(PacienteProfile);
    
    const medicoEmailToProfileId = {}; // mapear email a MedicoProfile ID
    
    // 1. Insertar médicos y crear sus perfiles
    console.log('👨‍⚕️ Creando médicos...');
    for (let i = 0; i < 5; i++) {
      const userData = {
        email: `medico${i+1}@nutriapp.com`,
        password: `medico${i+1}123`,
        name: `Dr. Nutri${i+1}`,
        role: Role.MEDICO,
      };

      const exists = await usersService.findOneByEmail(userData.email);
      let medico;
      
      if (exists) {
        medico = exists;
        console.log(`El médico ${userData.email} ya existe. Omitiendo.`);
      } else {
        medico = await usersService.createUser(userData);
        console.log(`✓ Médico ${userData.email} creado.`);
      }
      
      // Crear perfil de médico si no existe
      let medicoProfile = await medicoProfileRepo.findOne({
        where: { user: { id: medico.id } }
      });

      if (!medicoProfile) {
        const medicoData = medicosProfilesSeed[i];
        medicoProfile = medicoProfileRepo.create({
          especialidad: medicoData.specialty,
          numero_colegiado: medicoData.licenseNumber,
          biografia: `${medicoData.yearsExperience} años de experiencia`,
          user: medico,
        });
        await medicoProfileRepo.save(medicoProfile);
        console.log(`✓ Perfil de médico para ${userData.email} creado.`);
      }

      medicoEmailToProfileId[userData.email] = medicoProfile.id;
    }

    // 2. Insertar admin
    const adminData = usersSeed.find(u => u.role === 'admin');
    if (adminData) {
      const exists = await usersService.findOneByEmail(adminData.email);
      if (!exists) {
        await usersService.createUser(adminData);
        console.log(`✓ Admin ${adminData.email} creado.`);
      }
    }

    // 3. Insertar pacientes y asignar médico
    console.log('👥 Creando pacientes y asignando médicos...');
    for (let i = 0; i < 15; i++) {
      const pacienteData = {
        email: `paciente${i+1}@nutriapp.com`,
        password: `paciente${i+1}123`,
        name: `Paciente Demo${i+1}`,
        role: Role.PACIENTE,
        medicoId: (i % 5) + 1, // Asignar médico 1-5 de forma circular
      };

      const exists = await usersService.findOneByEmail(pacienteData.email);
      if (exists) {
        console.log(`El paciente ${pacienteData.email} ya existe. Omitiendo.`);
        continue;
      }

      const { medicoId, ...userCreateData } = pacienteData;
      const paciente = await usersService.createUser(userCreateData);
      
      // ✅ ASIGNAR MÉDICO CORRECTAMENTE
      const medicoEmail = `medico${medicoId}@nutriapp.com`;
      const medicoProfileId = medicoEmailToProfileId[medicoEmail];
      
      if (medicoProfileId) {
        const medicoProfile = await medicoProfileRepo.findOne({
          where: { id: medicoProfileId }
        });
        
        if (medicoProfile) {
          paciente.medicoAsignado = medicoProfile;
          await userRepo.save(paciente);
          console.log(`✓ Paciente ${paciente.email} asignado a ${medicoEmail}`);
        }
      }

      // Crear perfil de paciente
      const perfilData = pacientesProfilesSeed[i % pacientesProfilesSeed.length];
      const pacienteProfile = pacienteProfileRepo.create({
        fecha_nacimiento: perfilData.birthDate || '1990-01-01',
        peso_inicial_kg: perfilData.weight || 60,
        altura_cm: perfilData.height || 165,
        alergias_alimentarias: perfilData.allergies || '',
        toma_suplementos_hierro: false,
        user: paciente,
      });
      await pacienteProfileRepo.save(pacienteProfile);
      console.log(`✓ Perfil de paciente para ${paciente.email} creado.`);
    }

    // 4. Seeders de datos nutricionales
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
    await platillosSeed(dataSource); // <-- YA DEBE FUNCIONAR

    console.log('4. Relacionando platillos con ingredientes...');
    await platilloIngredientesSeed(dataSource); // <-- YA DEBE FUNCIONAR

    console.log('5. Sembrando registros de consumo...');
    await registrosSeed(dataSource);

    console.log('6. Sembrando metas (calculando hierro consumido)...');
    await metasSeed(dataSource);
    
    console.log('✅ Todos los seeders completados exitosamente.');
    
  } catch (error) {
    console.error('Error durante el sembrado:', error);
  } finally {
    await app.close();
    console.log('🌱 Sembrado (seeding) finalizado.');
  }
}

bootstrap();

export const runSeeders = async (dataSource: DataSource) => {
  const userRepo = dataSource.getRepository(User);
  const pacienteProfileRepo = dataSource.getRepository(PacienteProfile);
  const medicoProfileRepo = dataSource.getRepository(MedicoProfile);
  const nutrienteRepo = dataSource.getRepository(Nutriente);
  const ingredienteRepo = dataSource.getRepository(Ingrediente);
  const ingredienteNutrienteRepo = dataSource.getRepository(IngredienteNutriente);
  const platilloRepo = dataSource.getRepository(Platillo);
  const platilloIngredienteRepo = dataSource.getRepository(PlatilloIngrediente);

  console.log('🌱 Iniciando seeders...');

  // 1. USUARIOS
  console.log('👥 Creando usuarios...');
  const createdUsers: User[] = [];
  const medicosMap = new Map<number, MedicoProfile>();

  for (const userData of usersSeed) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = userRepo.create({
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      role: userData.role,
    });
    const savedUser = await userRepo.save(user);
    createdUsers.push(savedUser);

    // Si es médico, crear su perfil inmediatamente
    if (savedUser.role === Role.MEDICO) {
      const medicoData = medicosProfilesSeed.find(m => m.userEmail === savedUser.email);
      if (medicoData) {
        const medicoProfile = medicoProfileRepo.create({
          especialidad: medicoData.specialty,
          numero_colegiado: medicoData.licenseNumber,
          biografia: `${medicoData.yearsExperience} años de experiencia`,
          user: savedUser,
        });
        const savedMedicoProfile = await medicoProfileRepo.save(medicoProfile);
        
        // ✅ GUARDAR EN MAP usando el índice del seed
        const seedIndex = usersSeed.findIndex(u => u.email === savedUser.email);
        medicosMap.set(seedIndex, savedMedicoProfile);
        
        console.log(`✅ Médico creado: ${savedUser.email} (ID: ${savedUser.id}, ProfileID: ${savedMedicoProfile.id})`);
      }
    }
  }

  // 2. PERFILES DE PACIENTES + ASIGNACIÓN DE MÉDICO
  console.log('🏥 Creando perfiles de pacientes...');
  const pacientes = createdUsers.filter(u => u.role === Role.PACIENTE);

  for (let i = 0; i < pacientes.length; i++) {
    const paciente = pacientes[i];
    const perfilData = pacientesProfilesSeed[i % pacientesProfilesSeed.length];

    const pacienteProfile = pacienteProfileRepo.create({
      ...perfilData,
      user: paciente,
    });
    await pacienteProfileRepo.save(pacienteProfile);

    // ✅ CORRECCIÓN: Usar type assertion
    const seedIndex = usersSeed.findIndex(u => u.email === paciente.email);
    const pacienteSeed = usersSeed[seedIndex] as { medicoId?: number; [key: string]: any };
    const medicoSeedIndex = pacienteSeed?.medicoId;
    
    if (medicoSeedIndex !== undefined) {
      const medicoProfileId = medicosMap.get(medicoSeedIndex - 1);
      
      if (medicoProfileId) {
        paciente.medicoAsignado = medicoProfileId;
        await userRepo.save(paciente);
        console.log(`✅ Paciente ${paciente.email} asignado a médico (ProfileID: ${medicoProfileId.id})`);
      }
    }
  }

  // 3. NUTRIENTES
  console.log('🥗 Creando nutrientes...');
  for (const nutrienteData of nutrientesSeed) {
    if (!(await nutrienteRepo.findOne({ where: { name: nutrienteData.name } }))) {
      await nutrienteRepo.save(nutrienteRepo.create(nutrienteData));
    }
  }

  // 4. INGREDIENTES CON NUTRIENTES
  console.log('🍎 Creando ingredientes con nutrientes...');
  for (const ingredienteData of ingredientesSeed) {
    if (!(await ingredienteRepo.findOne({ where: { name: ingredienteData.name } }))) {
      const ingrediente = await ingredienteRepo.save(ingredienteRepo.create(ingredienteData));

      const nutrientesParaIngrediente = ingredienteNutrientesSeed.filter(
        (in_nut) => in_nut.ingrediente === ingredienteData.name
      );

      for (const in_nut of nutrientesParaIngrediente) {
        const nutriente = await nutrienteRepo.findOne({ where: { name: in_nut.nutriente } });
        if (nutriente) {
          await ingredienteNutrienteRepo.save(
            ingredienteNutrienteRepo.create({
              ingrediente,
              nutriente,
              value_per_100g: in_nut.value,
            })
          );
        }
      }
    }
  }

  // 5. PLATILLOS
  console.log('🍽️ Creando platillos...');
  await platillosSeed(dataSource); // <-- CAMBIO: Esta función ahora guarda directamente, no devuelve nada

  // 6. PLATILLO-INGREDIENTES
  console.log('🥘 Relacionando platillos con ingredientes...');
  await platilloIngredientesSeed(dataSource); // <-- CAMBIO: Esta función ahora guarda directamente, no devuelve nada

  // 7. REGISTROS DE CONSUMO
  console.log('📝 Creando registros de consumo...');
  await registrosSeed(dataSource);

  // 8. METAS (calculando hierro consumido)
  console.log('🎯 Creando metas diarias...');
  await metasSeed(dataSource);

  console.log('✅ Todos los seeders completados exitosamente.');
};